from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyCookie, HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

from config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(sub: str, jti: Optional[str] = None, ttl_min: Optional[int] = None) -> tuple[str, str, datetime]:
    jti = jti or str(uuid.uuid4())
    ttl = ttl_min or settings.access_token_ttl_min
    expire = _now() + timedelta(minutes=ttl)
    payload = {"sub": sub, "jti": jti, "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti, expire


# FastAPI security dependencies (shows the lock icon in docs)
cookie_security = APIKeyCookie(name=settings.cookie_name, auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(
    request: Request,
    cookie_token: Optional[str] = Depends(cookie_security),
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> Optional[str]:
    # Prefer cookie; fallback to Authorization: Bearer; allow X-Access-Token as a safe alternative header
    if cookie_token:
        return cookie_token
    if bearer and bearer.scheme.lower() == "bearer":
        return bearer.credentials
    x_token = request.headers.get("x-access-token")
    if x_token:
        return x_token
    return None


def decode_token_or_401(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
