# ashbyapi.py - FINAL VERSION

import os
import time
import uuid
import json
import logging
import hmac
import hashlib
from datetime import datetime
from typing import List, Dict, Any

import requests
from requests.auth import HTTPBasicAuth
from fastapi import FastAPI, HTTPException, APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import (
    Candidate, JobTitle, Framework, InterviewFeedback,
    Offer, ApplicationHistory
)
from sqlalchemy.ext.declarative import declarative_base
from deps import get_db, SessionLocal, engine

# --- CONFIGURATION & SETUP ---

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

ASHBY_API_KEY = os.getenv("ASHBY_API_KEY")
ASHBY_WEBHOOK_SECRET = os.getenv("ASHBY_WEBHOOK_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")

if not all([ASHBY_API_KEY, DATABASE_URL]):
    raise ValueError("Missing critical environment variables: ASHBY_API_KEY, DATABASE_URL")

if not ASHBY_WEBHOOK_SECRET:
    logging.warning("ASHBY_WEBHOOK_SECRET is not set. The webhook endpoint will be insecure.")

ASHBY_BASE_URL = "https://api.ashbyhq.com"

INTERVIEW_STAGE_TITLES_TO_SYNC = {
    "First Round", "Second Round", "Talent Acquisition Interview",
    "First Stage Interview", "Final Stage Interview", "Assessment Day",
    "TA Screen", "In Person or Virtual Interview with Hiring Team", "TA Interview"
}

router = APIRouter(prefix="/ashby", tags=["Ashby Integration"])


# --- REFINED ASHBY API CLIENT ---

def fetch_ashby_data(endpoint: str, payload: Dict = None, retries: int = 3, delay: int = 2) -> Dict:
    """A more robust function to fetch data from any paginated Ashby API endpoint."""
    if payload is None:
        payload = {}
    url = f"{ASHBY_BASE_URL}{endpoint}"
    headers = {"Accept": "application/json; version=1", "Content-Type": "application/json"}
    auth = HTTPBasicAuth(ASHBY_API_KEY, "")

    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=payload, auth=auth)
            response.raise_for_status()
            
            data = response.json()
            if not data.get('success', True):
                error_info = data.get('errorInfo', {})
                logging.error(f"Ashby API returned an error for {endpoint}. Full error info: {json.dumps(error_info)}")
                raise requests.exceptions.RequestException(f"Ashby API indicated failure: {error_info}")

            # Return the entire response, including the 'results' key
            return data

        except requests.exceptions.RequestException as e:
            logging.error(f"Request error for {endpoint} (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                raise Exception(f"Failed to fetch data from {endpoint} after {retries} attempts.") from e
    return {}

def fetch_paginated_results(endpoint: str, payload: Dict = None) -> List[Dict]:
    """Fetches all results from a paginated Ashby endpoint."""
    if payload is None:
        payload = {}
    
    all_results = []
    current_payload = payload.copy()

    while True:
        resp = fetch_ashby_data(endpoint, current_payload)
        results = resp.get("results", [])
        all_results.extend(results)
        
        logging.info(f"Fetched {len(results)} items from {endpoint}. Total so far: {len(all_results)}.")

        if resp.get("moreDataAvailable") and "nextCursor" in resp:
            current_payload["cursor"] = resp["nextCursor"]
        else:
            break
            
    return all_results

# --- HIGH LEVEL SYNC FUNCTION ---
def sync_candidates(db: Session) -> int:
    """Fetch applications from Ashby and store candidate data locally."""
    count = 0
    application_summaries = fetch_paginated_results("/application.list")
    for summary in application_summaries:
        app_id = summary.get("id")
        if not app_id:
            continue
        try:
            details = fetch_ashby_data("/application.info", {"applicationId": app_id}).get("results")
            if not details:
                continue
            stage_title = details.get("currentStage", {}).get("title")
            if stage_title not in INTERVIEW_STAGE_TITLES_TO_SYNC:
                continue
            process_application_details(db, details)
            count += 1
        except Exception as e:
            logging.error(f"Error syncing application {app_id}: {e}")
    return count

# --- CORE DATA PROCESSING LOGIC ---

def upsert_candidate(db: Session, candidate_data: Dict) -> Candidate:
    candidate_id_str = candidate_data.get("id")
    if not candidate_id_str: return None
    
    candidate_id = uuid.UUID(candidate_id_str)
    candidate = db.query(Candidate).get(candidate_id)
    
    if not candidate:
        candidate = Candidate(id=candidate_id)
        logging.info(f"Creating new candidate: {candidate_data.get('name')}")
    else:
        logging.info(f"Updating existing candidate: {candidate_data.get('name')}")
        
    candidate.name = candidate_data.get("name")
    candidate.email = candidate_data.get("email")
    candidate.phone = candidate_data.get("phone")
    candidate.status = candidate_data.get("status")
    candidate.resume_url = candidate_data.get("resumeUrl")
    
    db.merge(candidate)
    db.commit()
    return candidate

def process_application_feedback(db: Session, application_id: str, candidate_id: uuid.UUID):
    feedback_list = fetch_paginated_results("/applicationFeedback.list", {"applicationId": application_id})
    if not feedback_list: return

    for feedback_data in feedback_list:
        feedback_id_str = feedback_data.get("id")
        if not feedback_id_str: continue
        
        feedback_id = uuid.UUID(feedback_id_str)
        feedback = db.query(InterviewFeedback).get(feedback_id)

        if not feedback:
            feedback = InterviewFeedback(id=feedback_id, candidate_id=candidate_id)

        feedback.application_id = uuid.UUID(application_id)
        feedback.interviewer_name = feedback_data.get("submittedBy", {}).get("name")
        feedback.interviewer_email = feedback_data.get("submittedBy", {}).get("email")
        feedback.feedback_text = feedback_data.get("feedback")
        feedback.overall_recommendation = feedback_data.get("overallRecommendation")
        submitted_at_str = feedback_data.get("submittedAt")
        if submitted_at_str:
            feedback.submitted_at = datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00"))
            
        db.merge(feedback)
    
    db.commit()
    logging.info(f"Upserted {len(feedback_list)} feedback records for application {application_id}")


# --- REFACTORED processing function ---
def process_application_details(db: Session, application_data: Dict):
    """
    Main processing function. Given a FULL application object from Ashby,
    it saves all relevant data (candidate, feedback) to the DB.
    """
    application_id = application_data.get("id")
    candidate_data = application_data.get("candidate")
    
    if not application_id or not candidate_data:
        logging.warning("Skipping application due to missing ID or candidate data.")
        return

    try:
        candidate = upsert_candidate(db, candidate_data)
        if not candidate: return
            
        app_history_id = application_id
        app_history = db.query(ApplicationHistory).get(app_history_id)
        if not app_history:
            app_history = ApplicationHistory(id=app_history_id, candidate_id=candidate.id)

        job_id_val = application_data.get("jobId")
        app_history.job_id = uuid.UUID(job_id_val) if job_id_val else None
        app_history.status = application_data.get("status")
        stage_id_val = application_data.get("currentStageId")
        app_history.current_stage_id = uuid.UUID(stage_id_val) if stage_id_val else None
        app_history.current_stage_name = application_data.get("currentStage", {}).get("title")
        db.merge(app_history)
        db.commit()

        process_application_feedback(db, application_id, candidate.id)
        
        logging.info(f"Successfully processed application {application_id} for candidate {candidate.name}")

    except Exception as e:
        logging.error(f"An error occurred while processing application object for ID {application_id}: {e}", exc_info=True)


# --- FULL SYNC ENDPOINT ---

@router.post("/sync/full")
def full_sync_applications(db: Session = Depends(get_db)):
    """
    Performs a full sync of candidates in relevant interview stages.
    """
    start_time = time.time()
    logging.info("Starting full sync of Ashby applications...")
    logging.info("Step 1: Fetching all active application summaries...")
    
    all_application_summaries = fetch_paginated_results("/application.list")
    
    logging.info(f"Step 2: Processing {len(all_application_summaries)} applications to find relevant candidates.")
    processed_count = 0
    for app_summary in all_application_summaries:
        application_id = app_summary.get("id")
        if not application_id:
            continue

        try:
            # FINAL FIX: The parameter name for application info is 'applicationId', not 'id'.
            # This was the cause of the `invalid_input` error.
            app_details_response = fetch_ashby_data("/application.info", {"applicationId": application_id})
            
            # The actual application object is inside the 'results' key
            app_details = app_details_response.get("results")

            if not app_details:
                logging.warning(f"Could not retrieve details for application ID {application_id}. Skipping.")
                continue
            
            # Now, check the stage title from the full details object
            current_stage_title = app_details.get("currentStage", {}).get("title")
            if current_stage_title in INTERVIEW_STAGE_TITLES_TO_SYNC:
                # OPTIMIZATION: We already have the full application object, so we pass it directly.
                # This avoids fetching the same data again inside the processing function.
                process_application_details(db, app_details)
                processed_count += 1

        except Exception as e:
            logging.error(f"Failed to fetch or process details for application {application_id}: {e}", exc_info=True)
            # Continue to the next application even if one fails
            continue

    end_time = time.time()
    summary = f"Full sync complete in {end_time - start_time:.2f} seconds. Found and processed {processed_count} applications in relevant stages."
    logging.info(summary)
    return {"message": summary}


@router.post("/sync/candidates")
def sync_candidates_endpoint(db: Session = Depends(get_db)):
    """Convenience endpoint to trigger a full candidate sync."""
    synced = sync_candidates(db)
    return {"synced": synced}


# --- WEBHOOK HANDLER FOR LIVE UPDATES ---

async def verify_ashby_signature(request: Request, ashby_signature: str = Header(None)):
    if not ASHBY_WEBHOOK_SECRET:
        logging.warning("Skipping webhook signature verification because ASHBY_WEBHOOK_SECRET is not set.")
        return

    if not ashby_signature:
        raise HTTPException(status_code=403, detail="Ashby-Signature header is missing.")
    
    try:
        method, signature = ashby_signature.split('=')
        if method != 'sha256':
            raise HTTPException(status_code=400, detail="Unsupported signature method.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Ashby-Signature header format.")

    body = await request.body()
    expected_signature = hmac.new(key=ASHBY_WEBHOOK_SECRET.encode('utf-8'), msg=body, digestmod=hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=403, detail="Invalid signature.")


@router.post("/webhook", dependencies=[Depends(verify_ashby_signature)])
async def handle_ashby_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    event_type = payload.get("eventType")
    data = payload.get("data", {}) # 'data' contains the object related to the event
    
    logging.info(f"Received Ashby webhook for event: {event_type}")

    if event_type == "candidate.stage.change":
        # The 'data' payload for this event is a full Application object
        current_stage_title = data.get("currentStage", {}).get("title")
        if current_stage_title in INTERVIEW_STAGE_TITLES_TO_SYNC:
            logging.info(f"Application {data.get('id')} moved into a relevant stage. Processing...")
            # We can use our optimized function directly, as it expects the full application object
            process_application_details(db, data)
        else:
            logging.info(f"Ignoring stage change for application {data.get('id')} to stage '{current_stage_title}'.")

    elif event_type == "application.feedback.submit":
        # The 'data' payload is a Feedback object
        application_id = data.get("applicationId")
        candidate_id_str = data.get("candidateId")
        if application_id and candidate_id_str:
            logging.info(f"Processing new feedback for application: {application_id}")
            process_application_feedback(db, application_id, uuid.UUID(candidate_id_str))
            
    elif event_type == "ping":
        logging.info("Received 'ping' event from Ashby. Replying with success.")
        return {"message": "pong"}

    else:
        logging.info(f"Ignoring unhandled event type: {event_type}")
        
    return {"status": "received"}
