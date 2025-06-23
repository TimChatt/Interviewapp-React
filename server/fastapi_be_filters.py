from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from database import SessionLocal, CandidateInterview  # Assuming database.py contains DB setup

app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/get_all_candidates")
def get_all_candidates(
    db: Session = Depends(get_db),
    department: str = Query(None, description="Filter by department"),
    start_date: str = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    search_query: str = Query(None, description="Search by candidate ID")
):
    """Fetch all stored candidates with optional filtering."""
    query = db.query(CandidateInterview)
    
    if not any([department, start_date, end_date, search_query]):
        return {"success": False, "error": "At least one filter parameter must be provided."}
    
    if department:
        query = query.filter(CandidateInterview.department == department)
    if start_date and end_date:
        query = query.filter(
            and_(
                CandidateInterview.interview_date >= datetime.strptime(start_date, "%Y-%m-%d"),
                CandidateInterview.interview_date <= datetime.strptime(end_date, "%Y-%m-%d")
            )
        )
    if search_query:
        query = query.filter(CandidateInterview.candidate_id.contains(search_query))
    
    candidates = query.limit(100).all()  # Limit results to prevent overload
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
