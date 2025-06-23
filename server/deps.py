import os
from fastapi import Header, HTTPException

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import jwt

from models import AuditLog, User

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    PGUSER = os.getenv("PGUSER", "postgres")
    PGPASSWORD = os.getenv("PGPASSWORD")
    PGHOST = os.getenv("PGHOST", "postgres.railway.internal")
    PGPORT = os.getenv("PGPORT", "5432")
    PGDATABASE = os.getenv("PGDATABASE", "railway")
    DATABASE_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")

# Dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get current admin from JWT token

def get_current_admin(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    return payload


def log_admin_action(admin_username: str, action: str, target_username: str, db: Session):
    log_entry = AuditLog(
        admin_username=admin_username,
        action=action,
        target_username=target_username,
    )
    db.add(log_entry)
    db.commit()
