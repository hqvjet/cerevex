from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# Company Schemas
class CompanyBase(BaseModel):
    company_id: str
    company_name: str
    tax_code: str
    province: str
    hotline: str
    company_email: str
    address: str
    industry_type: str
    registered_at: Optional[datetime] = None


class CompanyCreate(BaseModel):
    company_name: str
    tax_code: str
    province: str
    hotline: str
    company_email: str
    address: str
    industry_type: str
    registered_at: Optional[datetime] = None


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    tax_code: Optional[str] = None
    province: Optional[str] = None
    hotline: Optional[str] = None
    company_email: Optional[str] = None
    address: Optional[str] = None
    industry_type: Optional[str] = None
    registered_at: Optional[datetime] = None


class CompanyOut(BaseModel):
    company_id: str
    company_name: str
    tax_code: str
    province: str
    hotline: str
    company_email: str
    address: str
    industry_type: str
    registered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    product_id: str
    company_id: str
    product_name: str
    third_party_id: str
    num_positive: int = Field(default=0)
    num_neutral: int = Field(default=0)
    num_negative: int = Field(default=0)
    short_summary: str
    added_at: Optional[datetime] = None


class ProductCreate(BaseModel):
    product_name: str
    third_party_id: str
    short_summary: str
    added_at: Optional[datetime] = None


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    third_party_id: Optional[str] = None
    num_positive: Optional[int] = None
    num_neutral: Optional[int] = None
    num_negative: Optional[int] = None
    short_summary: Optional[str] = None
    added_at: Optional[datetime] = None


class ProductOut(BaseModel):
    product_id: str
    company_id: str
    product_name: str
    third_party_id: str
    num_positive: int
    num_neutral: int
    num_negative: int
    short_summary: str
    added_at: Optional[datetime] = None

    class Config:
        from_attributes = True
