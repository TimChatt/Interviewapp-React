from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, String, Integer, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime

# Database Configuration
DATABASE_URL = "sqlite:///./interview_analysis.db"  # Use PostgreSQL or other DB for production
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define Database Models
class CandidateInterview(Base):
    __tablename__ = "candidate_interviews"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, unique=True, index=True)
    department = Column(String)
    interview_transcript = Column(Text)
    scorecard = Column(Text)  # Store as JSON string
    ai_predicted_score = Column(Text)  # Store AI-generated score
    interview_date = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/store_or_update_candidate")
def store_or_update_candidate(candidate_id: str, department: str, interview_transcript: str, scorecard: dict, ai_predicted_score: dict, db: Session = Depends(get_db)):
    """Store a candidate's interview data in the database."""
    existing_candidate = db.query(CandidateInterview).filter(CandidateInterview.candidate_id == candidate_id).first()
    if existing_candidate:
        existing_candidate.department = department
        existing_candidate.interview_transcript = interview_transcript
        existing_candidate.scorecard = str(scorecard)
        existing_candidate.ai_predicted_score = str(ai_predicted_score)
        db.commit()
        return {"success": True, "message": "Candidate interview data updated successfully."}
    
    candidate = CandidateInterview(
        candidate_id=candidate_id,
        department=department,
        interview_transcript=interview_transcript,
        scorecard=str(scorecard),
        ai_predicted_score=str(ai_predicted_score)
    )
    db.add(candidate)
    db.commit()
    return {"success": True, "message": "Candidate interview data stored successfully."}

@app.get("/get_all_candidates")
def get_all_candidates(db: Session = Depends(get_db)):
    """Fetch all stored candidates and their interview data."""
    candidates = db.query(CandidateInterview).all()
    return {"success": True, "data": [
        {
            "candidate_id": c.candidate_id,
            "department": c.department,
            "interview_transcript": c.interview_transcript,
            "scorecard": eval(c.scorecard),
            "ai_predicted_score": eval(c.ai_predicted_score),
            "interview_date": c.interview_date
        }
        for c in candidates
    ]}

@app.get("/get_candidate/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Fetch a specific candidate's interview transcript and scorecard."""
    candidate = db.query(CandidateInterview).filter(CandidateInterview.candidate_id == candidate_id).first()
    if not candidate:
        return {"success": False, "error": "Candidate not found"}
    return {
        "success": True,
        "data": {
            "candidate_id": candidate.candidate_id,
            "department": candidate.department,
            "interview_transcript": candidate.interview_transcript,
            "scorecard": eval(candidate.scorecard),
            "ai_predicted_score": eval(candidate.ai_predicted_score),
            "interview_date": candidate.interview_date
        }
    }
