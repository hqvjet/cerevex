from __future__ import annotations

from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import SignInRequest, UserCreate, UserOut, Message, AccessTokenResponse
from security import create_access_token, hash_password, verify_password, http_bearer, get_token_from_request, decode_token_or_401
from config import settings


router = APIRouter()


def set_auth_cookie(response: Response, token: str, expires: datetime):
    # Cookie-based auth removed; keep function for backward compat but no-op
    return None


@router.post("/signup", response_model=UserOut, summary="Sign up")
def signup(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    # Ensure unique email and user_id
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already in use")

    user = User(
    user_id=str(uuid4()),
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
        company_id=payload.company_id,
    )
    db.add(user)
    db.flush()

    # Stateless: issue JWT without persisting a server-side session
    token, _jti, exp = create_access_token(sub=user.user_id)
    # Cookie removed; expose token only via response body and optional header
    if settings.debug_expose_token:
        response.headers["X-Access-Token"] = token
    return user


@router.post("/signin", response_model=AccessTokenResponse, summary="Sign in (returns access token)", dependencies=[Depends(http_bearer)])
def signin(payload: SignInRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate user and return a JWT access token (Bearer only)."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token, _jti, exp = create_access_token(sub=user.user_id)
    # Optionally expose token in a header for debugging
    if settings.debug_expose_token:
        response.headers["X-Access-Token"] = token

    # Return the access token in JSON so non-browser clients can receive it
    # securely; browsers should rely on the HttpOnly cookie.
    return AccessTokenResponse(access_token=token, expires_at=exp)


@router.post("/signout", response_model=Message, summary="Sign out")
def signout(response: Response, token: str | None = Depends(get_token_from_request)):
    # Stateless signout: clients should discard their Bearer token
    return Message(message="signed out")
