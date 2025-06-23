from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

# Endpoints for HR policy management
from models import HRPolicyVersion, Policy
from schemas import HRPolicyRequest, RefinePolicyRequest, HRPolicyVersionCreate, PolicyUploadRequest, PolicyQueryRequest
from deps import get_db

# Assume OpenAI client is initialized elsewhere and imported
from openai_client import client

router = APIRouter()

@router.post("/api/refine-policy")
async def refine_policy(request: RefinePolicyRequest):
    try:
        prompt = f"""
        Below is an existing HR policy draft:
        {request.currentDraft}

        The user provided the following feedback for improvement:
        {request.feedback}

        Please refine the HR policy draft to address the feedback.
        Maintain clear sections such as Objectives, Scope, Guidelines, Responsibilities, and Review Process.
        Provide the refined policy as plain text.
        """
        logging.info(f"Refining policy with prompt: {prompt}")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are an expert HR policy consultant."}, {"role": "user", "content": prompt}],
            max_tokens=1200,
            temperature=0.7,
        )
        refined_policy = response.choices[0].message.content.strip()
        return {"refinedPolicy": refined_policy}
    except Exception as e:
        logging.error(f"Error refining policy document: {e}")
        raise HTTPException(status_code=500, detail="Failed to refine HR policy document.")


@router.post("/api/generate-policy")
async def generate_policy(request: HRPolicyRequest):
    try:
        prompt = f"""
        Generate a comprehensive HR policy document for the {request.business} business unit.
        Policy Type: {request.policyType}.
        Target Audience: {request.targetAudience or 'All relevant employees'}.
        Effective Date: {request.effectiveDate or 'N/A'}.
        Review Cycle: {request.reviewCycle or 'N/A'}.
        Legal Considerations: {request.legalConsiderations or 'Standard legal and regulatory compliance'}.
        Additional Context: {request.additionalContext or 'No additional context provided'}.

        Please include the following sections:
        1. Objectives
        2. Scope
        3. Guidelines and procedures
        4. Responsibilities and accountabilities
        5. Review and update process
        Provide the answer as plain text.
        """
        logging.info(f"Generating HR policy with prompt: {prompt}")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are an HR policy expert."}, {"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.7,
        )
        policy_document = response.choices[0].message.content.strip()
        return {"policyDocument": policy_document}
    except Exception as e:
        logging.error(f"Error generating HR policy document: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate HR policy document.")


@router.post("/api/save-policy-version")
async def save_policy_version(request: HRPolicyVersionCreate, db: Session = Depends(get_db)):
    new_version = HRPolicyVersion(
        business=request.business,
        policy_type=request.policy_type,
        target_audience=request.target_audience,
        effective_date=request.effective_date,
        review_cycle=request.review_cycle,
        legal_considerations=request.legal_considerations,
        additional_context=request.additional_context,
        draft_content=request.draft_content,
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return {"success": True, "version_id": new_version.id}


@router.get("/api/get-policy-versions")
async def get_policy_versions(business: str, policy_type: str, db: Session = Depends(get_db)):
    versions = db.query(HRPolicyVersion).filter(
        HRPolicyVersion.business == business,
        HRPolicyVersion.policy_type == policy_type,
    ).order_by(HRPolicyVersion.created_at.desc()).all()
    return {"versions": [
        {
            "id": version.id,
            "draft_content": version.draft_content,
            "created_at": version.created_at.isoformat(),
            "business": version.business,
            "policy_type": version.policy_type,
        }
        for version in versions
    ]}


@router.get("/api/get-policies")
async def get_policies(db: Session = Depends(get_db)):
    policies = db.query(Policy).order_by(Policy.created_at.desc()).all()
    return {"policies": [
        {
            "id": policy.id,
            "title": policy.title,
            "content": policy.content,
            "created_at": policy.created_at.isoformat(),
        }
        for policy in policies
    ]}


@router.post("/api/upload-policy")
async def upload_policy(request: PolicyUploadRequest, db: Session = Depends(get_db)):
    new_policy = Policy(title=request.title, content=request.policyText)
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    return {"success": True, "policy_id": new_policy.id}


@router.post("/api/query-policy")
async def query_policy(request: PolicyQueryRequest, db: Session = Depends(get_db)):
    policies = db.query(Policy).all()
    policies_text = "\n\n".join([f"Policy {i+1}: {p.content}" for i, p in enumerate(policies)])
    prompt = f"""
    You are an HR policy expert. Here are the following policies:
    {policies_text}

    Answer the following question regarding these policies:
    {request.query}

    Provide a concise answer.
    """
    logging.info(f"Querying policies with prompt: {prompt}")
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are an expert HR policy consultant."}, {"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7,
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        logging.error(f"Error in query-policy: {e}")
        raise HTTPException(status_code=500, detail="Failed to query policies")

