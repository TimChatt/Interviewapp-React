# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List

class CompetencyCreate(BaseModel):
    competency_name: str
    job_title: str
    job_level: Optional[str] = None
    category: Optional[str] = "Uncategorized"

class UserUpdateRequest(BaseModel):  # ✅ Previously added
    username: str
    action: str  # "approve" or "suspend"
    role: Optional[str] = None  # Optional role update

# ✅ Add missing IPWhitelistRequest to avoid NameError
class IPWhitelistRequest(BaseModel):
    ip: str  # ✅ Define IP address format if needed later


# --- User auth ---
class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


# --- HR policy models ---
class HRPolicyRequest(BaseModel):
    business: str = Field(..., title="Business")
    policyType: str = Field(..., title="Policy Type")
    targetAudience: Optional[str] = None
    effectiveDate: Optional[str] = None
    reviewCycle: Optional[str] = None
    legalConsiderations: Optional[str] = None
    additionalContext: Optional[str] = None


class RefinePolicyRequest(BaseModel):
    currentDraft: str
    feedback: str


class HRPolicyVersionCreate(BaseModel):
    business: str
    policy_type: str
    target_audience: Optional[str] = None
    effective_date: Optional[str] = None
    review_cycle: Optional[str] = None
    legal_considerations: Optional[str] = None
    additional_context: Optional[str] = None
    draft_content: str


class PolicyUploadRequest(BaseModel):
    title: Optional[str] = None
    policyText: str


class PolicyQueryRequest(BaseModel):
    query: str


