from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyCookie, HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from config import settings


# Mirror user-service's cookie + bearer behavior
cookie_security = APIKeyCookie(name=settings.cookie_name, auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(request: Request, cookie_token: str | None = Depends(cookie_security), bearer: HTTPAuthorizationCredentials | None = Depends(http_bearer)) -> str | None:
    if cookie_token:
        return cookie_token
    if bearer and bearer.scheme.lower() == "bearer":
        return bearer.credentials
    return None


def require_auth(token: str | None = Depends(get_token_from_request)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
