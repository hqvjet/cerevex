from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserOut, UserUpdate, SetCompanyRequest
from security import get_token_from_request, decode_token_or_401, hash_password, http_bearer


router = APIRouter()


def require_auth(token: str | None = Depends(get_token_from_request)) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token_or_401(token)
    return payload.get("sub")


def parse_roles(role_str: str) -> list[str]:
    return [r.strip() for r in (role_str or "").split(",") if r.strip()]


def ensure_admin(user: User):
    roles = parse_roles(user.role)
    if "admin" not in roles:
        raise HTTPException(status_code=403, detail="Admin role required")


@router.get("/me", response_model=UserOut, summary="Get current user", dependencies=[Depends(http_bearer)])
def get_me(user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserOut], summary="List users", dependencies=[Depends(http_bearer)])
def list_users(user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    caller = db.get(User, user_id)
    if not caller:
        raise HTTPException(status_code=404, detail="User not found")
    ensure_admin(caller)
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/{user_id}", response_model=UserOut, summary="Get user by id", dependencies=[Depends(http_bearer)])
def get_user(user_id: str, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut, summary="Update user", dependencies=[Depends(http_bearer)])
def update_user(user_id: str, payload: UserUpdate, caller_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    caller = db.get(User, caller_id)
    ensure_admin(caller)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.email is not None:
        # Ensure email unique
        exists = db.query(User).filter(User.email == payload.email, User.user_id != user_id).first()
        if exists:
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = payload.email
    if payload.password is not None:
        user.password = hash_password(payload.password)
    if payload.role is not None:
        user.role = payload.role
    if payload.company_id is not None:
        user.company_id = payload.company_id
    db.add(user)
    db.flush()
    return user


@router.delete("/{user_id}", response_model=None, status_code=204, summary="Delete user", dependencies=[Depends(http_bearer)])
def delete_user(user_id: str, caller_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    caller = db.get(User, caller_id)
    ensure_admin(caller)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    return None


@router.post("/me/company", response_model=UserOut, summary="Set my company_id if not set", dependencies=[Depends(http_bearer)])
def set_my_company(payload: SetCompanyRequest, user_id: str = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.company_id:
        raise HTTPException(status_code=409, detail="User already has a company")
    user.company_id = payload.company_id
    db.add(user)
    db.flush()
    return user
