from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from typing import Optional, List
from sqlalchemy.orm import Session

from database import get_db, Base  # Base imported just in case of future reflection
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String

from config import get_settings

ROLE_DATA_ANALYST = "data_analyst"


class _User(Base):  # lightweight reflection of users table
    __tablename__ = "users"
    user_id: Mapped[str] = mapped_column("user_id", String, primary_key=True)
    role: Mapped[str] = mapped_column(String, nullable=False)

http_bearer = HTTPBearer(auto_error=False)


def _decode(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_token(bearer: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)) -> str:
    if not bearer or bearer.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")
    return bearer.credentials


def get_current_user_claims(token: str = Depends(get_token)) -> dict:
    return _decode(token)


def _parse_roles(role_str: str | None) -> List[str]:
    if not role_str:
        return []
    return [r.strip() for r in role_str.split(",") if r.strip()]


def require_data_analyst(
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
) -> dict:
    # Prefer roles embedded in token if present
    role_str = (claims.get("roles") or claims.get("role") or "")
    roles = _parse_roles(role_str)
    if not roles:
        # Fallback: load from users table
        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user = db.get(_User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        roles = _parse_roles(user.role)
    if ROLE_DATA_ANALYST not in roles:
        raise HTTPException(status_code=403, detail="data_analyst role required")
    # Attach resolved roles for downstream usage
    claims["resolved_roles"] = roles
    return claims
