from __future__ import annotations

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from roles import has_role, ROLE_COMPANY_ADMIN
from security import get_token_from_request, decode_token_or_401


def require_auth(token: str | None = Depends(get_token_from_request)) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token_or_401(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return sub


def get_current_user(user_id: str = Depends(require_auth), db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_company_admin(user: User = Depends(get_current_user)) -> User:
    if not has_role(user.role, ROLE_COMPANY_ADMIN):
        raise HTTPException(status_code=403, detail="company_admin role required")
    if not user.company_id:
        raise HTTPException(status_code=409, detail="Admin must belong to a company")
    return user
