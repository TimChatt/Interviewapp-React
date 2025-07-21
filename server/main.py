import os
import asyncio
import logging
import threading
from typing import List, Optional, Dict, Any
from uuid import UUID

import bcrypt
import jwt
import pandas as pd
import httpx
import bleach
from bs4 import BeautifulSoup

from fastapi import FastAPI, HTTPException, Depends, Path, Header, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from dotenv import load_dotenv
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.orm import Session

from deps import engine, SessionLocal, get_db

# Load environment variables from .env
load_dotenv()

# --- Model and Schema Imports ---
from models import (
    Base, CompetencyTrend, JobTitle, JobDescription, Framework, Candidate,
    InterviewFeedback, ScorecardEntry, Offer, ApplicationHistory, User,
    InterviewQuestion, AnswerSuggestion, CompetencyEvolution, IPWhitelist,
    HRPolicyVersion, Policy, AuditLog
)
from schemas import CompetencyCreate, UserUpdateRequest, IPWhitelistRequest

# --- Ashby Integration Import ---
# CORRECT: We only need the router from our new ashbyapi module.
# The sync functions will be triggered via API endpoints defined within the router.
from server.ashbyapi import router as ashby_router
from server.ashbyapi import full_sync_applications, sync_candidates
# Functions used during startup and periodic updates

import subprocess

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")

# Fetch DATABASE_URL from Railway variables
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    PGUSER = os.getenv("PGUSER", "postgres")
    PGPASSWORD = os.getenv("PGPASSWORD")
    if not PGPASSWORD:
        raise ValueError("Database password not provided in environment variables.")
    PGHOST = os.getenv("PGHOST", "postgres.railway.internal")
    PGPORT = os.getenv("PGPORT", "5432")
    PGDATABASE = os.getenv("PGDATABASE", "railway")
    DATABASE_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

# Use shared engine from deps

# Test Database Connection (For Debugging)
try:
    connection = engine.connect()
    logging.info("✅ Connected to the database successfully!")
    connection.close()
except Exception as e:
    logging.error(f"❌ Failed to connect to the database: {e}")

def reset_alembic_history():
    print("🛠  Resetting Alembic version table...")
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM alembic_version"))
    print("✅ Alembic version table cleared.")

def run_migrations():
    alembic_cfg = Config("alembic.ini")
    reset_alembic_history()
    command.upgrade(alembic_cfg, "head")

# ✅ Step 1: Reset history
reset_alembic_history()

# ✅ Step 2: Run migrations
run_migrations()

app = FastAPI()
# Safe conditional mount for React frontend (avoids Railway crash)
frontend_dir = os.path.join(os.path.dirname(__file__), "client_build")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_catchall(full_path: str):
        return FileResponse(os.path.join(frontend_dir, "index.html"))

# Configure CORS before including any routers or endpoints
origins = [
    "https://interviewapp-react-production.up.railway.app",
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Ashby router after the middleware is in place
app.include_router(ashby_router)

from routers.users import router as users_router
from routers.policies import router as policies_router
from openai_client import client

app.include_router(users_router)
app.include_router(policies_router)

# Serve built React frontend if present
frontend_dir = os.path.join(os.path.dirname(__file__), "client_build")
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_catchall(full_path: str):
        return FileResponse(os.path.join(frontend_dir, "index.html"))

# Ashby API Key
ASHBY_API_KEY = os.getenv("ASHBY_API_KEY")
if not ASHBY_API_KEY:
    logging.error("❌ ASHBY_API_KEY is NOT loaded. Check Railway environment variables.")
else:
    logging.info(f"🔑 ASHBY_API_KEY Loaded: {ASHBY_API_KEY[:6]}********")

# JWT secret key
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")

STATIC_CATEGORIES = [
    "Technical Skills", "Leadership & Management", "Soft Skills",
    "Process & Delivery", "Domain-Specific Knowledge"
]

# Database setup comes from deps (SessionLocal)

# ─── LOAD YOUR EXCEL KEY ──────────────────────────────────────────────
# Allow overriding the path via environment variable
KEY_FILE = os.getenv("KEY_FILE", "data/Competency Key.xlsx")
SHEET_NAME = "Sheet1"

competency_key: Dict[str, Dict[str, str]] = {}
levels: List[str] = []
KEY_MD = ""

if os.path.exists(KEY_FILE):
    try:
        # Read into a DataFrame
        key_df = pd.read_excel(KEY_FILE, sheet_name=SHEET_NAME)

        # ─── Normalize headers: strip whitespace and lowercase ──────────
        key_df.columns = key_df.columns.str.strip().str.lower()

        # If there's no 'level' column, but the first column is unnamed, rename it
        if "level" not in key_df.columns:
            first_col = key_df.columns[0]
            if first_col.startswith("unnamed"):
                key_df = key_df.rename(columns={first_col: "level"})
            else:
                raise RuntimeError(
                    f"Competency Key sheet must have a 'level' column; got: {list(key_df.columns)}"
                )

        # Build the lookup dict
        levels = key_df["level"].tolist()
        for comp in key_df.columns.drop("level"):
            competency_key[comp] = {
                row["level"]: str(row[comp]).strip().replace("\n", " ")
                for _, row in key_df.iterrows()
            }

        # Serialize once into a big Markdown lookup block
        _md = ["## Competency Key"]
        for comp, lvl_map in competency_key.items():
            _md.append(f"### {comp}")
            for lvl in levels:
                _md.append(f"- **{lvl}**: {lvl_map[lvl]}")
            _md.append("")
        KEY_MD = "\n".join(_md)
        logging.info(f"✅ Loaded competency key from {KEY_FILE}")
    except Exception as e:
        logging.error(f"❌ Failed to load competency key: {e}")
else:
    logging.warning(f"⚠️ Competency key file not found: {KEY_FILE}. Continuing without it.")

# ─────────────────────────────────────────────────────────────────────

# (Re)import asyncio and logging if needed
import asyncio
import logging

async def update_candidates():
    """ Runs every 6 hours to update candidates from Ashby """
    while True:
        try:
            db = SessionLocal()
            logging.info("🔄 Running candidate update job...")
            count = sync_candidates(db)
            logging.info(f"✅ Synced {count} candidates from Ashby.")
        except Exception as e:
            logging.error(f"❌ Error updating candidates: {e}")
        finally:
            db.close()
        await asyncio.sleep(21600)  # 6 hours


# Create database tables (warning: does not auto-migrate existing tables)
Base.metadata.create_all(bind=engine)

# -------------------- DEPENDENCY -------------------- #

def run_migrations():
    """Run Alembic migrations automatically on app startup."""
    try:
        logging.info("🚀 Running Alembic migrations...")
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        logging.info("✅ Alembic migrations applied successfully.")
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Error running migrations: {e}")

# Run migrations before starting the app
run_migrations()

# -------------------- Pydantic MODELS -------------------- #
	
class Position(BaseModel):
    title: str
    problemSolving: str
    creativeOperationalThinking: str
    initiative: str
    communication: str
    influence: str
    autonomy: str
    commercialAwareness: str
    collaborationTeamWork: str

class GenerateRequest(BaseModel):
    department: str
    positions: List[Position]   # ← replaces jobTitle/jobLevels/competencies

class SaveCompetencyRequest(BaseModel):
    department: UUID  # Framework ID
    jobTitles: List[dict]  # List of job titles with their details

# This model will be used to update an existing job title (including optional salaries)
class UpdateJobTitleRequest(BaseModel):
    salaryMin: Optional[int] = None
    salaryMax: Optional[int] = None
    # If you also want to allow updating competencies fully:
    competencies: Optional[List[dict]] = None


class GenerateJobDescriptionRequest(BaseModel):
    job_title: str
    department: str
    responsibilities: Optional[List[str]] = []
    requirements: Optional[List[str]] = []

class SaveJobDescriptionRequest(BaseModel):
    job_title: str
    department: str
    description: str

class GenerateQuestionRequest(BaseModel):
    job_title: str = Field(..., title="Job Title", description="The job title for interview questions.")
    department: str = Field(..., title="Department", description="Department of the job.")
    competencies: list[str] = Field(..., title="Competencies", description="List of competencies.")

class SaveQuestionRequest(BaseModel):
    job_title: str
    question: str
    follow_up: str = None

class AnswerAssessmentRequest(BaseModel):
    question: str
    candidate_answer: str

# Define structure of a single question
class InterviewQuestionRequest(BaseModel):
    question: str
    follow_up: str
    competency: str  # ✅ Ensure competency is explicitly defined
    competencies_covered: List[str]  # ✅ Ensure competencies_covered is always included

# Define structure for the full request
class SaveInterviewQuestionsRequest(BaseModel):
    job_title: str
    questions: List[InterviewQuestionRequest]

class GenerateInterviewQuestionsRequest(BaseModel):
    job_title: str
    department: Optional[str] = None  # Some job titles might not have departments
    competencies: Optional[List[str]] = []


# Pydantic models for type validation
class FilterModel(BaseModel):
    location: Optional[str] = ""
    experience: Optional[str] = ""
    skills: Optional[str] = ""
    jobTitle: Optional[str] = ""
    company: Optional[str] = ""
    degree: Optional[str] = ""
    graduationYear: Optional[str] = ""
    languages: List[str] = []
    diversityFilters: List[str] = []

class SearchRequest(BaseModel):
    query: str
    filters: FilterModel

class Candidate(BaseModel):
    id: str
    name: str
    jobTitle: str
    company: str
    location: str
    summary: Optional[str] = None  # Added for AI-generated summary

# In-memory storage for candidates, purely for demonstration purposes.
candidate_storage: Dict[str, Dict[str, Any]] = {}

# -------------------- HELPER FUNCTIONS -------------------- #
def get_competencies_for_job(db: Session, job_title: str):
    """
    Retrieves competencies for a given job title.
    """
    job = db.query(JobTitle).filter(JobTitle.job_title == job_title).first()
    
    if not job or not job.competencies:
        return []

    return [competency["name"] for competency in job.competencies]  # Extract only competency names
    
def parse_generated_text(text, competencies, levels):
    logging.info("Parsing OpenAI response text...")
    sections = text.split("Competency:")  # Split text by "Competency:"
    structured_data = []

    for section in sections[1:]:  # Skip the first split part (it's before the first "Competency:")
        try:
            lines = section.strip().split("\n")  # Split section into lines
            competency_name = lines[0].strip()  # First line is the competency name
            levels_data = {}

            for line in lines[1:]:  # Process remaining lines
                if line.strip().startswith("- Level"):
                    level, description = line.split(":", 1)  # Split line into level and description
                    levels_data[level.strip()] = description.strip()  # Add level and description to dict
                else:
                    logging.debug(f"Ignoring unexpected line: {line.strip()}")

            # Append structured data if valid competency and levels are found
            if competency_name and levels_data:
                structured_data.append({
                    "competency": competency_name,
                    "levels": levels_data,
                })
            else:
                logging.warning(f"Competency or levels data missing in section: {section}")

        except Exception as parse_error:
            logging.error(f"Error parsing section: {section}. Error: {parse_error}")
            continue

    logging.info(f"Parsed competencies: {structured_data}")
    return structured_data

def log_competency_change(
    competency_name: str,
    job_title: str,
    job_level: str,
    change_type: str,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    db: Session = None
):
    """
    Logs a competency change in the CompetencyEvolution table.
    Should be called when competencies are created, modified, or deleted.
    """
    try:
        change_entry = CompetencyEvolution(
            competency_name=competency_name,
            job_title=job_title,
            job_level=job_level,
            change_type=change_type,
            old_value=old_value if old_value else "None",
            new_value=new_value if new_value else "None",
            date_changed=datetime.utcnow()
        )
        db.add(change_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log competency change: {str(e)}")

def categorize_with_ai(competency_name, competency_description=""):
    """ Uses GPT-3.5 to categorize a competency into predefined categories. """
    try:
        prompt = f"""
        Categorize the following competency into one of these categories:
        {', '.join(STATIC_CATEGORIES)}.

        Competency: {competency_name}
        Description: {competency_description if competency_description else 'No description available'}

        Only return the category name from the list above.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=15,
            temperature=0.3
        )

        ai_category = response.choices[0].message.content.strip()

        return ai_category if ai_category in STATIC_CATEGORIES else "Uncategorized"

    except Exception as e:
        return "Uncategorized"  # Fallback in case of error

def categorize_competency(competency_name):
    """
    Categorizes a competency using AI first, then falls back to keyword mapping.
    """
    try:
        # 🔥 AI Call for Categorization
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional HR expert. Categorize competencies into one of the predefined categories."
                },
                {
                    "role": "user",
                    "content": f"Which category does the competency '{competency_name}' belong to? Choose from: "
                               "'Technical Skills', 'Leadership & Management', 'Soft Skills', 'Process & Delivery', "
                               "'Domain-Specific Knowledge', 'Innovation & Problem-Solving', 'Customer & Business Acumen'."
                }
            ]
        )
        
        ai_category = response["choices"][0]["message"]["content"].strip()
        if ai_category in STATIC_CATEGORIES:
            return ai_category  # ✅ If AI assigns a valid category, return it

    except Exception as e:
        logging.warning(f"⚠️ AI categorization failed: {e}. Falling back to keyword mapping.")

    # 🔥 Fallback: Keyword Mapping
    category_mapping = {
        "Technical Skills": ["Software Engineering", "Machine Learning", "Data Science"],
        "Leadership & Management": ["Strategic Thinking", "People Management"],
        "Soft Skills": ["Communication", "Collaboration", "Empathy"],
        "Process & Delivery": ["Agile Methodologies", "Project Management"],
        "Domain-Specific Knowledge": ["Financial Analysis", "Cybersecurity"],
        "Innovation & Problem-Solving": ["Design Thinking", "Creativity"],
        "Customer & Business Acumen": ["Sales Strategy", "Market Research"]
    }

    for category, keywords in category_mapping.items():
        if any(keyword.lower() in competency_name.lower() for keyword in keywords):
            return category

    return "Uncategorized"  # ✅ Default if AI + keyword matching fails


def fetch_and_store_data(session):
    """ Fetch and store departments and jobs in correct order """

    logging.info("🚀 Fetching departments from Ashby API...")
    departments = fetch_department_list()  # ✅ Fetch departments first

    if departments:
        for dept in departments:
            logging.info(f"📌 Storing Department: {dept}")  # Log before inserting
            new_dept = Framework(
                id=dept["id"],  
                department=dept["name"],  
                parent_id=dept.get("parentId"),  
                is_archived=dept.get("isArchived", False)
            )
            session.merge(new_dept)  # ✅ Prevents duplicates
        session.commit()
        logging.info(f"✅ {len(departments)} departments stored successfully!")
    else:
        logging.warning("⚠️ No departments found in API response.")

    logging.info("🚀 Fetching jobs from Ashby API...")
    jobs = fetch_job_list()  # ✅ Now fetch jobs after departments

    if jobs:
        for job in jobs:
            logging.info(f"📌 Storing Job: {job}")  # Log before inserting
            
            # Check if department exists first
            department = session.query(Framework).filter_by(id=job["departmentId"]).first()
            if not department:
                logging.warning(f"❌ Department {job['departmentId']} not found for job {job['title']}. Skipping...")
                continue  # Skip storing this job
            
            new_job = JobTitle(
                id=job["id"],  
                department_id=job["departmentId"],  
                job_title=job["title"],  
                status=job.get("status", "Unknown"),
                employment_type=job.get("employmentType", "Unknown"),
                created_at=job.get("createdAt"),
                updated_at=job.get("updatedAt")
            )

            session.merge(new_job)
        session.commit()
        logging.info(f"✅ {len(jobs)} jobs stored successfully!")
    else:
        logging.warning("⚠️ No jobs found in API response.")



# -------------------- ROUTES -------------------- #
# ... other imports

def generate_xray_query(query: str, filters: Dict[str, Any]) -> str:
    prompt = (
        f"Optimize the following candidate search description into an X-ray search query for sourcing candidates, "
        f"targeting professional profiles on LinkedIn. "
        f"Search description: '{query}'. "
        f"Filters: {filters}. "
        f"Return a single search query string."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=50,
        )
        xray_query = response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("OpenAI API error:", e)
        # Fallback query if API call fails
        xray_query = f'site:linkedin.com/in/ "{query}"'
    return xray_query

# -----------------------------------------------------------------------------
# Function to perform a search request using the generated X-ray query
# -----------------------------------------------------------------------------
async def perform_search(xray_query: str) -> List[dict]:
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://www.google.com/search"
    params = {"q": xray_query}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers, timeout=10.0)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"HTTP request failed: {e}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Search engine error")

    soup = BeautifulSoup(response.text, "html.parser")
    results = []
    
    # Naively parse search result snippets (this part is illustrative and may need refining)
    for element in soup.find_all("div", class_="BNeawe"):
        text = element.get_text().strip()
        if text:
            candidate = {
                "id": str(len(results) + 1),
                "name": text.split()[0] if text.split() else "Unknown",
                "jobTitle": " ".join(text.split()[1:3]) if len(text.split()) >= 3 else "Unknown",
                "company": f"Company {len(results) + 1}",
                "location": f"Location {len(results) + 1}"
            }
            results.append(candidate)
    
    # Save retrieved candidates for later details/summarization
    for candidate in results:
        candidate_storage[candidate["id"]] = candidate

    return results

# -----------------------------------------------------------------------------
# POST /search: Generate query, perform search, and return candidates
# -----------------------------------------------------------------------------
@app.post("/search")
async def search_candidates(request: SearchRequest):
    filters_dict = request.filters.dict()
    
    # Use AI to generate an optimized X-ray search query
    xray_query = generate_xray_query(request.query, filters_dict)
    print("Generated X-ray query:", xray_query)
    
    # Execute the search using the AI-optimized query
    search_results = await perform_search(xray_query)
    return search_results

# -----------------------------------------------------------------------------
# GET /candidate/{candidate_id}: Retrieve candidate details and AI summary
# -----------------------------------------------------------------------------
@app.get("/candidate/{candidate_id}")
async def get_candidate(candidate_id: str):
    candidate = candidate_storage.get(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # AI Feature: Summarize candidate details
    summary_prompt = (
        f"Summarize the following candidate's profile details in a concise paragraph: {candidate}"
    )
    try:
        summary_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": summary_prompt}],
            temperature=0.5,
            max_tokens=100,
        )
        summary = summary_response["choices"][0]["message"]["content"].strip()
        candidate["summary"] = summary
    except Exception as e:
        print("Error generating summary:", e)
        candidate["summary"] = "Summary unavailable due to an error."
    
    return candidate


@app.get("/api/get-interview-job-titles")
async def get_interview_job_titles(department: str, db: Session = Depends(get_db)):
    try:
        department_framework = db.query(Framework).filter(Framework.department == department).first()
        if not department_framework:
            logging.error(f"❌ Department '{department}' not found in Framework table.")
            raise HTTPException(status_code=404, detail=f"Department '{department}' not found.")
        
        job_titles = db.query(JobTitle).filter(JobTitle.department_id == department_framework.id).all()
        if not job_titles:
            logging.warning(f"⚠️ No job titles found for department: {department}")
            return {"job_titles": []}
        
        return {
            "job_titles": [
                {
                    "job_title": job.job_title,
                    "competencies": job.competencies if job.competencies else [],
                    "job_description": (
                        lambda entry: entry.description if entry else None
                    )(
                        db.query(JobDescription)
                        .filter(cast(JobDescription.job_title_id, String) == str(job.id))
                        .first()
                    ),
                }
                for job in job_titles
            ]
        }
    except Exception as e:
        logging.error(f"❌ Error fetching interview job titles for department {department}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching interview job titles.")


@app.post("/api/generate-interview-questions")
async def generate_interview_questions(request: GenerateInterviewQuestionsRequest):
    try:
        job_title = request.job_title
        department = request.department or "Unknown"
        competencies = request.competencies or []

        logging.info(f"🛠️ Generating questions for: {job_title} in {department} with competencies {competencies}")

        # 🔥 AI Prompt - Explicit JSON instruction
        prompt = f"""
        You are an expert interview question generator. 
        Generate structured interview questions for the role of {job_title} in {department}.

        **Focus on these competencies:** {", ".join(competencies) if competencies else "General skills"}.
        For each competency, generate **at least 2-3 questions**.
        Each question should have a follow-up question.

        ### **Format output as strict JSON (NO extra text, only JSON response)**:
        
        [
          {{"competency": "Software Engineering", "question": "Primary Question 1", "follow_up": "Follow-up Question 1"}},
          {{"competency": "Design Thinking", "question": "Primary Question 2", "follow_up": "Follow-up Question 2"}}
        ]
        """

        chat_completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert interview question generator. Only return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2500,
            temperature=0.7,
        )

        raw_ai_response = chat_completion.choices[0].message.content.strip()

        logging.info(f"✅ Raw AI Response (Before Parsing): {raw_ai_response}")

        # 🔥 Fix OpenAI Wrapping JSON in Markdown Blocks
        cleaned_response = raw_ai_response.strip().replace("```json", "").replace("```", "")

        # 🔄 Try Parsing JSON
        try:
            generated_questions = json.loads(cleaned_response)
            logging.info(f"✅ Parsed Questions: {generated_questions}")
        except json.JSONDecodeError as e:
            logging.error(f"❌ AI Response is not valid JSON. Error: {e}")
            generated_questions = []

        return {"questions": generated_questions}

    except Exception as e:
        logging.error(f"❌ Error generating interview questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate interview questions")


@app.post("/api/save-interview-questions")
async def save_interview_questions(request: SaveInterviewQuestionsRequest, db: Session = Depends(get_db)):
    try:
        job_title = db.query(JobTitle).filter(JobTitle.job_title == request.job_title).first()
        if not job_title:
            raise HTTPException(status_code=404, detail="Job title not found.")

        saved_questions = []
        for q in request.questions:
            competency_value = q.competency if hasattr(q, "competency") and q.competency else "General Skills"
            competencies_covered_value = q.competencies_covered if hasattr(q, "competencies_covered") else [competency_value]

            new_question = InterviewQuestion(
                job_title_id=job_title.id,
                question=q.question,
                follow_up=q.follow_up or "",
                competency=competency_value,
                competencies_covered=competencies_covered_value,  # ✅ Now properly stored as JSON
            )
            db.add(new_question)
            saved_questions.append(new_question)

        db.commit()
        return {"success": True, "message": f"Saved {len(saved_questions)} questions successfully."}

    except Exception as e:
        db.rollback()
        logging.error(f"❌ Error saving interview questions: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving interview questions: {e}")


@app.post("/api/assess-candidate-answer")
async def assess_candidate_answer(request: AnswerAssessmentRequest):
    """
    AI-powered evaluation of a candidate's interview response.
    """
    prompt = f"""
    Evaluate the candidate's response to the following interview question.

    Question: {request.question}
    Candidate's Answer: {request.candidate_answer}

    Provide a score from 1 (Poor) to 4 (Great), along with an explanation.
    Format:
    - Score: [1-4]
    - Explanation: [Why the score was given]
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are an experienced interviewer."},
                  {"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.6,
    )

    analysis = response.choices[0].message.content.strip()
    score_line = next((line for line in analysis.split("\n") if line.startswith("Score:")), "Score: N/A")
    explanation = next((line for line in analysis.split("\n") if line.startswith("Explanation:")), "Explanation: N/A")

    return {
        "score": score_line.replace("Score: ", ""),
        "explanation": explanation.replace("Explanation: ", "")
    }


@app.post("/api/save-custom-question")
async def save_custom_question(request: SaveQuestionRequest, db: Session = Depends(get_db)):
    """
    Saves a custom interview question.
    """
    job_title = db.query(JobTitle).filter(JobTitle.job_title == request.job_title).first()
    if not job_title:
        raise HTTPException(status_code=404, detail="Job title not found.")

    new_question = InterviewQuestion(
        job_title_id=job_title.id,
        question=request.question,
        follow_up=request.follow_up
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return {"success": True, "message": "Question saved successfully."}


@app.get("/api/get-interview-questions/{job_title}")
async def get_interview_questions(job_title: str, db: Session = Depends(get_db)):
    """
    Retrieves saved interview questions for a job title.
    """
    job = db.query(JobTitle).filter(JobTitle.job_title == job_title).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job title not found.")

    questions = db.query(InterviewQuestion).filter(InterviewQuestion.job_title_id == job.id).all()

    return {
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "follow_up": q.follow_up,
                "competencies_covered": q.competencies_covered if q.competencies_covered else [],  # ✅ Fix
            }
            for q in questions
        ]
    }

# 1) Generate Competencies (one call per position)
# 1) Generate Competencies with Brave/Owners/Inclusive breakdown
@app.post("/api/generate-competencies")
async def generate_competencies(request: GenerateRequest):
    results = []

    for pos in request.positions:
        # Build a focused prompt for this single position
        prompt = f"""
You are an expert HR consultant. Using the Competency Key provided, craft exactly three richly detailed sentences—
one each for Brave, Owners, and Inclusive—summarizing how the following role should demonstrate all eight competencies
at the specified levels.

Competency Key:
{KEY_MD}

Role: {pos.title}  (Department: {request.department})

| Competency               | Level    |
|--------------------------|----------|
| Problem Solving          | {pos.problemSolving} |
| Creative/Operational     | {pos.creativeOperationalThinking} |
| Initiative               | {pos.initiative} |
| Communication            | {pos.communication} |
| Influence                | {pos.influence} |
| Autonomy                 | {pos.autonomy} |
| Commercial Awareness     | {pos.commercialAwareness} |
| Collaboration & Team Work| {pos.collaborationTeamWork} |

Please output **exactly** in this format (no extra text):

Brave: [one sentence]
Owners: [one sentence]
Inclusive: [one sentence]
"""
        # Call OpenAI
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert HR consultant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.6,
        )
        text = resp.choices[0].message.content.strip()

        # Parse the three lines
        breakdown = {"Brave": "", "Owners": "", "Inclusive": ""}
        for line in text.splitlines():
            for key in breakdown:
                if line.startswith(f"{key}:"):
                    breakdown[key] = line.split(f"{key}:", 1)[1].strip()

        # Fallback if any label was missed
        # e.g. take the first three sentences in order
        if not all(breakdown.values()):
            parts = [s.strip() for s in text.split("\n") if ":" in s]
            for idx, key in enumerate(breakdown.keys()):
                if idx < len(parts):
                    breakdown[key] = parts[idx].split(":",1)[1].strip()

        results.append({
            "title": pos.title,
            "breakdown": breakdown
        })

    if not results:
        raise HTTPException(status_code=500, detail="No descriptions generated.")

    return {"success": True, "competencyDescriptions": results}


# 2) Save Competencies (Create new frameworks/job titles)
class SaveCompetencyRequest(BaseModel):
    department: UUID  # Now expects a UUID for the framework id
    jobTitles: List[dict]  # List of job titles with their details

# Updated log_competency_change: remove inner commit so that the outer endpoint commits once
def log_competency_change(
    competency_name: str,
    job_title: str,
    job_level: str,
    change_type: str,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    db: Session = None
):
    try:
        change_entry = CompetencyEvolution(
            competency_name=competency_name,
            job_title=job_title,
            job_level=job_level,
            change_type=change_type,
            old_value=old_value if old_value else "None",
            new_value=new_value if new_value else "None",
            date_changed=datetime.utcnow()
        )
        db.add(change_entry)
        # Removed db.commit() here to allow one commit in the outer endpoint.
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log competency change: {str(e)}")


# Updated /api/save-competencies endpoint
@app.post("/api/save-competencies")
async def save_competencies(request: SaveCompetencyRequest, db: Session = Depends(get_db)):
    """
    Saves new competencies and logs newly created ones.
    """
    try:
        # Look up the framework by its id (sent by the frontend as a UUID)
        existing_framework = db.query(Framework).filter(Framework.id == request.department).first()
        if not existing_framework:
            raise HTTPException(status_code=404, detail="Department not found")
        department_id = existing_framework.id

        # Process each job title provided in the request
        for job_title in request.jobTitles:
            # Convert competencies if they are provided as strings
            processed_competencies = []
            for comp in job_title.get("competencies", []):
                if isinstance(comp, str):
                    processed_competencies.append({"name": comp, "descriptions": {}})
                else:
                    processed_competencies.append(comp)

            # Create a new JobTitle record WITHOUT salary_min/salary_max
            job_title_entry = JobTitle(
                department_id=department_id,
                job_title=job_title["job_title"],
                competencies=processed_competencies
            )
            db.add(job_title_entry)

            # Log competency creation for each competency in this job title
            for competency in processed_competencies:
                if not isinstance(competency, dict) or "name" not in competency or "descriptions" not in competency:
                    continue
                log_competency_change(
                    competency_name=competency["name"],
                    job_title=job_title["job_title"],
                    job_level="N/A",  # Use "N/A" if job levels aren’t stored automatically
                    change_type="Created",
                    old_value="None",
                    new_value=str(competency["descriptions"]),
                    db=db
                )

        # Commit all changes at once
        db.commit()
        return {"success": True, "message": "Competency framework saved successfully", "department_id": str(department_id)}

    except Exception as e:
        db.rollback()
        logging.error(f"Error saving framework: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while saving the framework.")


        
# 3) Search Frameworks
@app.get("/api/search-frameworks")
async def search_frameworks(query: str = "", db: Session = Depends(get_db)):
    try:
        # If the query is empty, return all frameworks
        if not query.strip():
            logging.info("No query provided, fetching all frameworks.")
            frameworks = db.query(Framework).all()
        else:
            logging.info(f"Query provided: {query}, searching frameworks by department.")
            # Now filtering only by department name
            frameworks = db.query(Framework).filter(
                Framework.department.ilike(f"%{query}%")
            ).all()

        if not frameworks:
            logging.info("No frameworks found for the query.")
            return {"frameworks": []}

        return {"frameworks": [
            {key: value for key, value in framework.__dict__.items() if key != "_sa_instance_state"}
            for framework in frameworks
        ]}

    except Exception as e:
        logging.error(f"Error searching frameworks: {e}")
        raise HTTPException(status_code=500, detail="Error searching frameworks.")

# 4) Get Framework by ID
@app.get("/api/get-framework/{id}")
async def get_framework(id: int, db: Session = Depends(get_db)):
    framework = db.query(Framework).filter(Framework.id == id).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    return {
        "id": framework.id,
        "department": framework.department,
        "job_titles": [
            {
                "job_title": job.job_title,
                "job_levels": job.job_levels,
                "competencies": job.competencies,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max
            }
            for job in framework.job_titles
        ]
    }

# 5) Get Job Title Details (by Department & JobTitle)
@app.get("/api/get-framework/{department}/{jobTitle}")
async def get_job_title_details(department: str, jobTitle: str, db: Session = Depends(get_db)):
    try:
        framework = db.query(Framework).filter(Framework.department == department).first()
        
        if not framework:
            raise HTTPException(status_code=404, detail="Department not found.")
        
        job_title = db.query(JobTitle).filter(
            JobTitle.job_title == jobTitle,
            JobTitle.department_id == framework.id
        ).first()

        if not job_title:
            raise HTTPException(status_code=404, detail="Job title not found.")
        
        # Return job title details
        return {
            "department": framework.department,
            "job_title": job_title.job_title,
            "job_levels": job_title.job_levels,  # can be split in frontend
            "competencies": job_title.competencies,
            "salary_min": job_title.salary_min,
            "salary_max": job_title.salary_max
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6) Delete a framework by ID
@app.delete("/api/delete-framework/{id}")
async def delete_framework(id: int = Path(..., title="Framework ID"), db: Session = Depends(get_db)):
    try:
        framework = db.query(Framework).filter(Framework.id == id).first()
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        
        # Delete related job titles as well
        for job in framework.job_titles:
            db.delete(job)
        
        db.delete(framework)
        db.commit()
        return {"success": True, "message": f"Framework with id {id} deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting framework: {e}")
        raise HTTPException(status_code=500, detail="Error deleting framework.")

# 7) Get all job titles for a given department
@app.get("/api/get-job-titles")
async def get_job_titles(department: str, db: Session = Depends(get_db)):
    try:
        department_framework = db.query(Framework).filter(Framework.department == department).first()

        if not department_framework:
            raise HTTPException(status_code=404, detail="Department not found")

        job_titles = db.query(JobTitle).filter(JobTitle.department_id == department_framework.id).all()

        return {"job_titles": [
            {"job_title": job.job_title} for job in job_titles
        ]}
    except Exception as e:
        logging.error(f"Error fetching job titles for department {department}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching job titles.")

# 8) Get Job Title Details (filtered by specific job_level)
@app.get("/api/get-job-title-details/{department}/{job_title}/{job_level}")
async def get_job_title_details(department: str, job_title: str, job_level: str, db: Session = Depends(get_db)):
    try:
        logging.info(f"Fetching job title details for department: {department}, job_title: {job_title}, job_level: {job_level}")
        framework = db.query(Framework).filter(Framework.department == department).first()
        if not framework:
            raise HTTPException(status_code=404, detail="Framework for the department not found")
        
        job_title_entry = db.query(JobTitle).filter(
            JobTitle.job_title == job_title,
            JobTitle.department_id == framework.id
        ).first()
        if not job_title_entry:
            raise HTTPException(status_code=404, detail="Job title not found")
        
        competencies = job_title_entry.competencies or []
        competency_for_level = []
        for competency in competencies:
            # Ensure competency is a dict and get descriptions safely
            if not isinstance(competency, dict):
                continue
            descriptions = competency.get("descriptions", {})
            if not isinstance(descriptions, dict):
                descriptions = {}
            # Filter descriptions based on job_level string
            filtered_descriptions = {
                level: description
                for level, description in descriptions.items()
                if job_level in level
            }
            if filtered_descriptions:
                competency_for_level.append({
                    "name": competency.get("name", ""),
                    "descriptions": filtered_descriptions
                })
        
        # Use getattr to safely retrieve salary_min and salary_max, defaulting to None if they don't exist
        salary_min = getattr(job_title_entry, "salary_min", None)
        salary_max = getattr(job_title_entry, "salary_max", None)
        
        return {
            "job_title": job_title_entry.job_title,
            "job_level": job_level,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "competencies": competency_for_level
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error fetching job title details: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching job title details.")


# 9) **UPDATE** Job Title Details (new)
@app.put("/api/update-job-title-details/{department}/{job_title}/{job_level}")
async def update_job_title_details(
    department: str,
    job_title: str,
    job_level: str,
    updated_data: UpdateJobTitleRequest,
    db: Session = Depends(get_db)
):
    """
    Updates job title details, including salary and competencies.
    Ensures competency changes are saved in `job_titles` and logged in `competency_evolution`.
    """
    framework = db.query(Framework).filter(Framework.department == department).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Department not found")

    job_title_entry = db.query(JobTitle).filter(
        JobTitle.job_title == job_title,
        JobTitle.department_id == framework.id
    ).first()
    if not job_title_entry:
        raise HTTPException(status_code=404, detail="Job title not found")

    # Track old competencies before update
    old_competencies = {comp["name"]: comp for comp in job_title_entry.competencies} if job_title_entry.competencies else {}

    if updated_data.competencies is not None:
        new_competencies = {comp["name"]: comp for comp in updated_data.competencies}

        # Detect added competencies
        for comp_name, new_comp in new_competencies.items():
            if comp_name not in old_competencies:
                log_competency_change(
                    competency_name=comp_name,
                    job_title=job_title,
                    job_level=job_level,
                    change_type="Created",
                    old_value="None",
                    new_value=str(new_comp["descriptions"]),
                    db=db
                )

        # Detect modified competencies
        for comp_name, old_comp in old_competencies.items():
            if comp_name in new_competencies:
                old_desc = old_comp["descriptions"]
                new_desc = new_competencies[comp_name]["descriptions"]
                if old_desc != new_desc:  # Check if descriptions changed
                    log_competency_change(
                        competency_name=comp_name,
                        job_title=job_title,
                        job_level=job_level,
                        change_type="Modified",
                        old_value=str(old_desc),
                        new_value=str(new_desc),
                        db=db
                    )

        # Detect deleted competencies
        for comp_name in old_competencies.keys():
            if comp_name not in new_competencies:
                log_competency_change(
                    competency_name=comp_name,
                    job_title=job_title,
                    job_level=job_level,
                    change_type="Deleted",
                    old_value=str(old_competencies[comp_name]["descriptions"]),
                    new_value="None",
                    db=db
                )

        # ✅ **SAVE updated competencies to `job_titles`**
        job_title_entry.competencies = updated_data.competencies

    # ✅ **Ensure salaries are also updated**
    if updated_data.salaryMin is not None:
        job_title_entry.salary_min = updated_data.salaryMin
    if updated_data.salaryMax is not None:
        job_title_entry.salary_max = updated_data.salaryMax

    db.commit()  # ✅ Save changes to `job_titles`
    db.refresh(job_title_entry)

    return {
        "success": True,
        "message": "Job title details updated successfully",
        "job_title": job_title_entry.job_title,
        "job_levels": job_title_entry.job_levels,
        "salary_min": job_title_entry.salary_min,
        "salary_max": job_title_entry.salary_max,
        "competencies": job_title_entry.competencies
    }

def populate_initial_trends(db: Session):
    """
    Populates competency_trend table with the latest competency data for tracking.
    This should only run if no competency trend data exists.
    """
    try:
        existing_trends = db.query(CompetencyTrend).count()
        logging.info(f"🔍 Checking existing competency trends... Found: {existing_trends}")

        if existing_trends > 0:
            logging.info("✅ Competency trend data already exists. Skipping population.")
            return

        job_titles = db.query(JobTitle).all()
        migrated_count = 0

        for job in job_titles:
            if not job.competencies:
                continue

            for competency in job.competencies:
                logging.info(f"📌 Adding competency to trends: {competency['name']} in {job.framework.department}")

                new_entry = CompetencyTrend(
                    competency_name=competency["name"],
                    month=datetime.utcnow().month,
                    year=datetime.utcnow().year,
                    average_score=0,  # Set initial score for tracking
                    department=job.framework.department,
                )
                db.add(new_entry)
                migrated_count += 1

        db.commit()
        logging.info(f"✅ Populated {migrated_count} competencies into competency_trend.")

    except Exception as e:
        db.rollback()
        logging.error(f"❌ Failed to populate competency trends: {e}")

@app.post("/api/generate-job-description")
async def generate_job_description(request: GenerateJobDescriptionRequest):
    """
    Generates a job description using OpenAI.
    """
    resp_lines = "\n".join(request.responsibilities) if request.responsibilities else "Use standard responsibilities for this role."
    req_lines = "\n".join(request.requirements) if request.requirements else "Use standard requirements for this role."
    prompt = f"""
    Write a professional job description for the role of {request.job_title} in the {request.department} department working for Hawk-Eye Innovations.
    Responsibilities:
    {resp_lines}
    Requirements:
    {req_lines}
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.7,
    )

    job_description = response.choices[0].message.content.strip()
    return {"job_description": job_description}

import bleach

@app.post("/api/save-job-description")
async def save_job_description(request: SaveJobDescriptionRequest, db: Session = Depends(get_db)):
    """
    Saves a job description to the database after sanitizing the HTML.
    """
    clean_html = bleach.clean(request.description, tags=["p", "br", "b", "i", "u", "strong", "em", "ul", "ol", "li"])  # ✅ Allows only safe tags

    framework = db.query(Framework).filter(Framework.department == request.department).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Department not found.")

    job_title_entry = db.query(JobTitle).filter(
        JobTitle.job_title == request.job_title, 
        JobTitle.department_id == framework.id
    ).first()

    if not job_title_entry:
        raise HTTPException(status_code=404, detail="Job title not found.")

    existing_description = db.query(JobDescription).filter(JobDescription.job_title_id == job_title_entry.id).first()

    if existing_description:
        existing_description.description = clean_html  # ✅ Store sanitized HTML
        existing_description.updated_at = str(datetime.utcnow())
    else:
        new_description = JobDescription(
            job_title_id=job_title_entry.id,
            description=clean_html,  # ✅ Store sanitized HTML
        )
        db.add(new_description)

    db.commit()
    return {"success": True, "message": "Job description saved successfully"}

@app.get("/api/get-job-description/{department}/{job_title}")
async def get_job_description(department: str, job_title: str, db: Session = Depends(get_db)):
    """
    Retrieves a stored job description by department and job title.
    """
    framework = db.query(Framework).filter(Framework.department == department).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Department not found.")

    job_title_entry = db.query(JobTitle).filter(
        JobTitle.job_title == job_title, 
        JobTitle.department_id == framework.id
    ).first()

    if not job_title_entry:
        raise HTTPException(status_code=404, detail="Job title not found.")

    job_description = db.query(JobDescription).filter(JobDescription.job_title_id == job_title_entry.id).first()
    
    if not job_description:
        raise HTTPException(status_code=404, detail="No job description found for this role.")

    return {"job_description": job_description.description}  # ✅ Returns HTML safely

@app.post("/api/analyze-job-description")
async def analyze_job_description(description: str = Body(..., embed=True)):
    """
    Uses AI to analyze job descriptions for biased language and suggests neutral alternatives.
    """
    try:
        sanitized_description = bleach.clean(description)  # ✅ Clean input to prevent script injection

        prompt = f"""
        Analyze the following job description for gendered or biased language and suggest neutral alternatives.

        Job Description:
        {sanitized_description}

        Provide the response in this format:
        - **Biased Terms:** [List the biased words found]
        - **Suggested Edits:** [Provide neutral alternatives]
        - **Overall Score:** [1-10, with 10 being fully inclusive]
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.5,
        )

        analysis = response.choices[0].message.content.strip()
        return {"analysis": analysis}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze job description: {str(e)}")

@app.post("/api/improve-job-description")
async def improve_job_description(description: str = Body(..., embed=True)):
    """
    Uses AI to refine a job description, making it more structured, engaging, and inclusive.
    """
    try:
        sanitized_description = bleach.clean(description)  # ✅ Clean input

        prompt = f"""
        Improve the following job description by:
        - Enhancing clarity and professionalism
        - Making it more structured and engaging
        - Ensuring inclusivity by removing biased or exclusionary language

        Job Description:
        {sanitized_description}

        Provide the improved version only, without extra commentary.
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
            temperature=0.7,
        )

        improved_description = response.choices[0].message.content.strip()
        return {"improved_description": improved_description}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to improve job description: {str(e)}")

@app.get("/api/get-department-competencies/{department}")
async def get_department_competencies(department: str, db: Session = Depends(get_db)):
    """ Retrieves competencies for a department, assigning AI categories if missing. """
    try:
        framework = db.query(Framework).filter(Framework.department == department).first()
        if not framework:
            raise HTTPException(status_code=404, detail="Department not found")

        job_titles = db.query(JobTitle).filter(JobTitle.department_id == framework.id).all()

        competencies = {}
        for job in job_titles:
            for competency in job.competencies:
                # Use stored category or assign a new one via AI
                category = competency.get("category") or categorize_with_ai(competency["name"], competency.get("description", ""))
                
                # Store AI-assigned category back to DB (so it doesn’t run again)
                competency["category"] = category
                db.commit()  # Save category to DB

                # Group by category
                if category not in competencies:
                    competencies[category] = []

                competencies[category].append({
                    "competency": competency["name"],
                    "description": competency.get("description", "No description available"),
                })

        return {"competencies": competencies}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- FASTAPI STARTUP EVENT -------------------- #
@app.on_event("startup")
def on_startup():
    """
    On server startup, run the initial Ashby data sync in a background thread
    so the server can start immediately without blocking.
    """
    def run_initial_sync():
        logging.info("Background thread started for initial Ashby sync.")
        db = SessionLocal()
        try:
            # We call the new, correct sync function from ashbyapi.py
            # Note: This is a long-running task.
            full_sync_applications(db)
            logging.info("✅ Initial Ashby data synchronization complete.")
        except Exception as e:
            logging.error(f"❌ Error during initial background sync: {e}", exc_info=True)
        finally:
            db.close()

    logging.info("🚀 Triggering initial data synchronization in the background...")
    # Run the sync in a separate thread to not block the startup process
    thread = threading.Thread(target=run_initial_sync, daemon=True)
    thread.start()

    # Start background task for periodic updates
    loop = asyncio.get_event_loop()
    loop.create_task(update_candidates())


# Health check endpoint
@app.get("/")
def health_check():
    return {"status": "OK"}

@app.get("/api/get-competency-history/{competency_name}")
async def get_competency_history(
    competency_name: str,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieves historical changes of a specific competency, filtered by department if provided.
    """
    try:
        query = db.query(CompetencyEvolution).filter(
            CompetencyEvolution.competency_name == competency_name
        )
        if department:
            query = query.filter(CompetencyEvolution.job_title.in_(
                db.query(JobTitle.job_title).join(Framework).filter(Framework.department == department)
            ))

        history = query.all()

        return [
            {
                "competency_name": record.competency_name,
                "job_title": record.job_title,
                "job_level": record.job_level,
                "change_type": record.change_type,
                "old_value": record.old_value,
                "new_value": record.new_value,
                "date_changed": record.date_changed.isoformat() if isinstance(record.date_changed, datetime) else record.date_changed,
            }
            for record in history
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch competency history: {str(e)}")

@app.get("/api/get-trends-over-time")
async def get_trends_over_time(
    department: Optional[str] = Query(None), db: Session = Depends(get_db)
):
    """
    Retrieves competency trends over time, filtered by department if provided.
    """
    try:
        query = db.query(CompetencyTrend)
        if department:
            query = query.filter(CompetencyTrend.department == department)

        trends = query.all()

        return [
            {
                "competency_name": trend.competency_name,
                "month": trend.month,
                "year": trend.year,
                "average_score": trend.average_score,
                "department": trend.department,
            }
            for trend in trends
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch competency trends: {str(e)}")

@app.get("/api/get-departments")
async def get_departments(db: Session = Depends(get_db)):
    """
    Retrieves all unique departments from the Framework table, including department IDs.
    """
    try:
        frameworks = db.query(Framework.id, Framework.department).distinct().all()
        department_list = [{"id": f.id, "department": f.department} for f in frameworks]

        if not department_list:
            raise HTTPException(status_code=404, detail="No departments found")

        return {"departments": department_list}

    except Exception as e:
        logging.error(f"Error fetching departments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch departments")


@app.get("/api/get-department-competencies/{department}")
async def get_department_competencies(department: str, db: Session = Depends(get_db)):
    """
    Fetches all competencies across a department, along with associated job titles.
    """
    # Fetch the framework record for the specified department.
    framework = db.query(Framework).filter(Framework.department == department).first()
    if not framework:
        raise HTTPException(status_code=404, detail=f"Department '{department}' not found.")

    # Fetch all job titles for this department.
    job_titles = db.query(JobTitle).filter(JobTitle.department_id == framework.id).all()

    # Aggregate competencies across all job titles.
    competency_map = {}
    for job in job_titles:
        if job.competencies:  # Ensure competencies exist
            for comp in job.competencies:  # Loop through the JSON list
                comp_name = comp.get("name")  # Extract competency name
                if comp_name:
                    if comp_name in competency_map:
                        competency_map[comp_name].add(job.job_title)
                    else:
                        competency_map[comp_name] = {job.job_title}

    # Convert set values to lists for JSON response compatibility.
    competencies_list = [{"competency": comp, "job_titles": list(job_titles)} for comp, job_titles in competency_map.items()]

    return {
        "department": framework.department,
        "competencies": competencies_list
    }

@app.get("/api/get-categorized-framework/{id}")
async def get_categorized_framework(id: int, db: Session = Depends(get_db)):
    logging.info(f"🔍 Fetching framework for ID: {id}")

    framework = db.query(Framework).filter(Framework.id == id).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")

    # Ensure categories exist
    categorized_competencies = {category: [] for category in STATIC_CATEGORIES}

    for job in framework.job_titles:
        logging.info(f"🔍 Processing job title: {job.job_title}")

        for competency in job.competencies:
            competency_name = competency.get("name")
            logging.info(f"🔎 Looking up competency: {competency_name}")

            competency_record = db.query(CompetencyEvolution).filter(
                CompetencyEvolution.competency_name == competency_name
            ).first()

            # Ensure category exists in response
            if competency_record and competency_record.category:
                category = competency_record.category.strip()
            else:
                logging.warning(f"⚠️ No category found for '{competency_name}', defaulting to 'Uncategorized'.")
                category = "Uncategorized"

            if category not in categorized_competencies:
                categorized_competencies[category] = []  # Ensure category exists

            categorized_competencies[category].append(competency)

    # 🚨 **Fix: Ensure a valid response structure is always returned**
    return {
        "id": framework.id,
        "department": framework.department,
        "competencies_by_category": categorized_competencies or {},  # 🔥 Prevents frontend crash
    }


@app.post("/api/add-competency")
async def add_competency(competency: CompetencyCreate, db: Session = Depends(get_db)):
    """
    Adds a new competency and assigns a category if it doesn't exist.
    """
    existing_competency = (
        db.query(CompetencyEvolution)
        .filter(CompetencyEvolution.competency_name == competency.name)
        .first()
    )

    if existing_competency:
        raise HTTPException(status_code=400, detail="Competency already exists.")

    # 🔥 Auto-categorize competency
    assigned_category = categorize_competency(competency.name)

    new_competency = CompetencyEvolution(
        competency_name=competency.name,
        job_title=competency.job_title,
        job_level=competency.job_level,
        change_type="Created",
        old_value=None,
        new_value=competency.name,
        date_changed=datetime.utcnow(),
        category=assigned_category,  # ✅ Assign AI-determined category
    )

    db.add(new_competency)
    db.commit()
    db.refresh(new_competency)

    return {"message": "Competency added successfully", "category": assigned_category}
    
# -------------------- MIGRATION FUNCTION -------------------- #
def migrate_existing_competencies(db: Session):
    """
    Transfers historical competency data from job_titles to competency_evolution.
    This ensures we have a record of all existing competencies in the evolution tracking table.
    """
    try:
        # Get all job titles
        job_titles = db.query(JobTitle).all()
        migrated_count = 0

        for job in job_titles:
            if not job.competencies:  # Skip if no competencies
                continue

            for competency in job.competencies:
                competency_name = competency["name"]
                descriptions = str(competency["descriptions"])  # Convert JSON to string for storage
                
                # Check if this competency already exists in competency_evolution
                existing_entry = db.query(CompetencyEvolution).filter(
                    CompetencyEvolution.competency_name == competency_name,
                    CompetencyEvolution.job_title == job.job_title,
                    CompetencyEvolution.job_level == "N/A",  # Since we're bulk importing
                ).first()

                if not existing_entry:
                    # Insert into competency_evolution as an "Initial Record"
                    new_entry = CompetencyEvolution(
                        competency_name=competency_name,
                        job_title=job.job_title,
                        job_level="N/A",
                        change_type="Initial Record",
                        old_value="None",
                        new_value=descriptions,
                        date_changed=datetime.utcnow()
                    )
                    db.add(new_entry)
                    migrated_count += 1

        db.commit()  # Commit all new entries
        logging.info(f"✅ Migrated {migrated_count} competency records from job_titles to competency_evolution.")

    except Exception as e:
        db.rollback()
        logging.error(f"❌ Failed to migrate competency data: {e}")

@app.get("/candidates")
def get_candidates(db: Session = Depends(get_db)):
    """Return all candidates stored in the local database."""
    cands = db.query(Candidate).all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
        }
        for c in cands
    ]

@app.get("/interviews")
def get_interviews():
    return fetch_interview_list()

@app.get("/jobs")
def get_jobs():
    return fetch_job_list()

@app.get("/departments")
def get_departments():
    return fetch_department_list()


# -------------------- RUN MIGRATION AT STARTUP -------------------- #
with SessionLocal() as db:
    migrate_existing_competencies(db)


# -------------------- MAIN -------------------- #
if __name__ == "__main__":
    import uvicorn

    logging.info("🔄 Fetching and storing departments & jobs before server start...")

    session = SessionLocal()
    try:
        fetch_and_store_data(session)
    finally:
        session.close()

    logging.info("🚀 Starting the FastAPI server...")

    # ✅ This line is the only change:
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
