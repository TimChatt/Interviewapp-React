from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Boolean, Float, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID  
import uuid

Base = declarative_base()

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HRPolicyVersion(Base):
    __tablename__ = "hr_policy_versions"

    id = Column(Integer, primary_key=True, index=True)
    business = Column(String, nullable=False)
    policy_type = Column(String, nullable=False)
    target_audience = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    review_cycle = Column(String, nullable=True)
    legal_considerations = Column(String, nullable=True)
    additional_context = Column(String, nullable=True)
    draft_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CompetencyTrend(Base):
    __tablename__ = "competency_trends"

    id = Column(Integer, primary_key=True, index=True)
    competency_name = Column(String, index=True)
    department = Column(String, index=True)
    month = Column(Integer)
    year = Column(Integer)
    average_score = Column(Float, default=0)


class JobTitle(Base):
    __tablename__ = "job_titles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("frameworks.id"), nullable=True)
    job_title = Column(String, index=True)
    status = Column(String)
    employment_type = Column(String)
    location_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    competencies = Column(JSON, nullable=True)

    # Relationships
    department = relationship("Framework", back_populates="job_titles")
    job_description = relationship(
        "JobDescription", uselist=False, back_populates="job_title", cascade="all, delete-orphan"
    )
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    job_title_id = Column(UUID(as_uuid=True), ForeignKey("job_titles.id"), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    job_title = relationship("JobTitle", back_populates="job_description")


class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department = Column(String, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("frameworks.id"), nullable=True)
    is_archived = Column(Boolean, default=False)

    # Relationships
    job_titles = relationship("JobTitle", back_populates="department", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="department", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("frameworks.id"), nullable=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_titles.id"), nullable=True)
    interview_stage = Column(String, nullable=True)
    application_stage = Column(String, nullable=True)
    application_history = Column(String, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # New column for incremental sync
    archived = Column(Boolean, default=False)

    # Relationships
    job = relationship("JobTitle", back_populates="candidates")
    department = relationship("Framework", back_populates="candidates")
    interview_feedback = relationship("InterviewFeedback", back_populates="candidate", cascade="all, delete-orphan")
    scorecard_entries = relationship("ScorecardEntry", back_populates="candidate", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="candidate", cascade="all, delete-orphan")
    application_histories = relationship("ApplicationHistory", back_populates="candidate", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"))
    application_id = Column(UUID(as_uuid=True), nullable=True)
    interviewer_name = Column(String)
    interviewer_email = Column(String)
    feedback_text = Column(String)
    overall_recommendation = Column(String)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    candidate = relationship("Candidate", back_populates="interview_feedback")


class ScorecardEntry(Base):
    __tablename__ = "scorecard_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"))  # Updated to use UUID
    category = Column(String, nullable=True)
    skill = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    comments = Column(Text, nullable=True)
    interviewer_id = Column(String, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    candidate = relationship("Candidate", back_populates="scorecard_entries")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), nullable=True)  # Assuming job IDs are UUIDs
    status = Column(String, nullable=True)  # e.g., Offered, Accepted, etc.
    offered_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)

    # Relationship
    candidate = relationship("Candidate", back_populates="offers")


class ApplicationHistory(Base):
    __tablename__ = "application_history"

    id = Column(String, primary_key=True)  # Using String for id as API might not provide a UUID
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String, nullable=True)
    current_stage_id = Column(UUID(as_uuid=True), nullable=True)
    current_stage_name = Column(String, nullable=True)
    stage_history = Column(JSON, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    # Relationship
    candidate = relationship("Candidate", back_populates="application_histories")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_approved = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    role = Column(String, default="user")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    job_title_id = Column(UUID(as_uuid=True), ForeignKey("job_titles.id"), nullable=False)
    question = Column(Text, nullable=False)
    follow_up = Column(Text, nullable=True)
    competency = Column(String, nullable=False)
    competencies_covered = Column(JSON, nullable=False, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    answers = relationship("AnswerSuggestion", back_populates="question", cascade="all, delete-orphan")


class AnswerSuggestion(Base):
    __tablename__ = "answer_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False)
    score = Column(Integer, nullable=False)
    answer = Column(Text, nullable=False)

    # Relationship
    question = relationship("InterviewQuestion", back_populates="answers")


class CompetencyEvolution(Base):
    __tablename__ = "competency_evolution"

    id = Column(Integer, primary_key=True, index=True)
    competency_name = Column(String, index=True)
    job_title = Column(String)
    job_level = Column(String)
    change_type = Column(String)
    old_value = Column(Text)
    new_value = Column(Text)
    date_changed = Column(DateTime)
    category = Column(String, default="Uncategorized")


class IPWhitelist(Base):
    __tablename__ = "ip_whitelist"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String, nullable=False)
    action = Column(String, nullable=False)
    target_username = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
