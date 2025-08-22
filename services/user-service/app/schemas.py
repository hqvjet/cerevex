from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    user_id: str
    email: EmailStr
    role: str = Field(description="Comma-separated roles, e.g., 'user' or 'user,admin'")
    company_id: Optional[str] = None
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "user"
    company_id: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[str] = None


class UserOut(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    company_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class Message(BaseModel):
    message: str


class AccessTokenResponse(BaseModel):
    access_token: str | None = None
    token_type: str = "bearer"
    expires_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJI...",
                "token_type": "bearer",
                "expires_at": "2025-08-22T12:34:56+00:00",
            }
        }


class SetCompanyRequest(BaseModel):
    company_id: str
