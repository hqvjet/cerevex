from __future__ import annotations

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from security import require_auth


# Lightweight proxy of current user fetched from user-service DB structure.
# We assume the same database (or a view) contains the users table as in user-service.
# If not, replace this with an HTTP call to user-service.
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class _Base(DeclarativeBase):
    pass


class _User(_Base):
    __tablename__ = "users"
    user_id: Mapped[str] = mapped_column("user_id", String, primary_key=True)
    company_id: Mapped[str | None] = mapped_column(String, nullable=True)


class CurrentUser:
    def __init__(self, user_id: str, company_id: str | None):
        self.user_id = user_id
        self.company_id = company_id


def get_current_user(payload: dict = Depends(require_auth), db: Session = Depends(get_db)) -> CurrentUser:
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.get(_User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return CurrentUser(user_id=user.user_id, company_id=user.company_id)


def require_company_user(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if not current.company_id:
        raise HTTPException(status_code=403, detail="Company membership required")
    return current
