from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from config import settings


"""Bearer-only auth helpers for enterprise service."""
http_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(request: Request, bearer: HTTPAuthorizationCredentials | None = Depends(http_bearer)) -> str | None:
    if bearer and bearer.scheme.lower() == "bearer":
        return bearer.credentials
    # Fallback custom header
    token = request.headers.get("X-Access-Token")
    if token:
        return token
    return None


def require_auth(token: str | None = Depends(get_token_from_request)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
