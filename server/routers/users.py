from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
import jwt
from models import User, IPWhitelist, AuditLog
from schemas import UserUpdateRequest, IPWhitelistRequest, SignupRequest, LoginRequest
from deps import get_db, JWT_SECRET, get_current_admin, log_admin_action

router = APIRouter()


@router.post("/api/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    hashed_password = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    new_user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        is_approved=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"success": True, "message": "Registration successful. Await admin approval."}

@router.post("/api/login")
async def login_endpoint(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(request.password.encode("utf-8"), user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_approved:
        raise HTTPException(status_code=403, detail="User not approved")

    payload = {
        "username": user.username,
        "role": user.role,
        "is_admin": user.is_admin,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return {"username": user.username, "token": token, "role": user.role, "is_admin": user.is_admin}

@router.get("/api/users/pending")
async def get_pending_users(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    pending_users = db.query(User).filter(User.is_approved == False).all()
    return [{"username": user.username, "email": user.email} for user in pending_users]

@router.put("/api/users/{username}/approve")
async def approve_user(username: str, admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = True
    db.commit()
    db.refresh(user)

    return {"success": True, "message": f"User {username} has been approved."}

@router.get("/api/users")
def get_users(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "username": user.username,
            "email": user.email,
            "is_approved": user.is_approved,
            "is_suspended": user.is_suspended,
            "role": user.role.strip("'")
        }
        for user in users
    ]

@router.put("/api/users/update")
def update_user_status(request: UserUpdateRequest, admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.action == "approve":
        user.is_approved = True
        user.is_suspended = False
    elif request.action == "suspend":
        user.is_suspended = True
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    if request.role:
        user.role = request.role

    db.commit()
    return {"success": True, "message": f"User {request.username} updated successfully."}

@router.get("/api/audit-logs")
def get_audit_logs(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return [
        {
            "admin_username": log.admin_username,
            "action": log.action,
            "target_username": log.target_username,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]

@router.get("/api/ip-whitelist")
def get_ip_whitelist(admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    ips = db.query(IPWhitelist).all()
    return [ip.ip_address for ip in ips]

@router.post("/api/ip-whitelist")
def add_ip_to_whitelist(request: IPWhitelistRequest, admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing_ip = db.query(IPWhitelist).filter(IPWhitelist.ip_address == request.ip).first()
    if existing_ip:
        raise HTTPException(status_code=400, detail="IP already whitelisted")
    new_ip = IPWhitelist(ip_address=request.ip)
    db.add(new_ip)
    db.commit()
    log_admin_action(admin["username"], "Added IP to Whitelist", request.ip, db)
    return {"success": True, "message": "IP added successfully."}

@router.delete("/api/ip-whitelist")
def remove_ip_from_whitelist(request: IPWhitelistRequest, admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    ip_entry = db.query(IPWhitelist).filter(IPWhitelist.ip_address == request.ip).first()
    if not ip_entry:
        raise HTTPException(status_code=404, detail="IP not found in whitelist")
    db.delete(ip_entry)
    db.commit()
    log_admin_action(admin["username"], "Removed IP from Whitelist", request.ip, db)
    return {"success": True, "message": "IP removed successfully."}

