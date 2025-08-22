from __future__ import annotations

from uuid import uuid4
from typing import List
from fastapi import APIRouter, Depends, HTTPException
import requests
from sqlalchemy.orm import Session

from database import get_db
from models import Company, Product
from schemas import CompanyCreate, CompanyOut, CompanyUpdate, ProductCreate, ProductOut, ProductUpdate
from deps import get_current_user, require_company_user, CurrentUser
from security import http_bearer, get_token_from_request
from config import settings

router = APIRouter(dependencies=[Depends(http_bearer)])


# --- Companies ---
@router.post("/companies", response_model=CompanyOut, summary="Create company (allowed to users with or without company)")
def create_company(payload: CompanyCreate, current: CurrentUser = Depends(get_current_user), token: str | None = Depends(get_token_from_request), db: Session = Depends(get_db)):
    # If user already has company, do not allow creating another
    if current.company_id:
        raise HTTPException(status_code=409, detail="User already has a company")
    company = Company(
        company_id=str(uuid4()),
        company_name=payload.company_name,
        tax_code=payload.tax_code,
        province=payload.province,
        hotline=payload.hotline,
        company_email=payload.company_email,
        address=payload.address,
        industry_type=payload.industry_type,
        registered_at=payload.registered_at,
    )
    db.add(company)
    db.flush()
    # Commit so other services (user-service) can see the row for FK validation
    db.commit()
    # Call user-service to assign the company to the current user
    user_service_url = settings.user_service_url.rstrip("/")
    try:
        r = requests.post(
            f"{user_service_url}/users/me/company",
            json={"company_id": company.company_id},
            headers={"Authorization": f"Bearer {token}"} if token else {},
            timeout=settings.http_timeout_sec,
        )
        if r.status_code == 409:
            # Race where user just got a company elsewhere
            # Compensate: delete the company we just created to avoid orphan
            try:
                db.delete(db.get(Company, company.company_id))
                db.commit()
            finally:
                pass
            raise HTTPException(status_code=409, detail="User already has a company")
        if r.status_code >= 400:
            # Compensate on failure
            try:
                db.delete(db.get(Company, company.company_id))
                db.commit()
            finally:
                pass
            raise HTTPException(status_code=502, detail=f"Failed to update user company: {r.text}")
    except requests.RequestException as e:
        # Compensate on failure
        try:
            db.delete(db.get(Company, company.company_id))
            db.commit()
        finally:
            pass
        raise HTTPException(status_code=502, detail=f"User service unreachable: {e}")
    return company


@router.get("/companies", response_model=List[CompanyOut], summary="List companies (scoped to caller company)")
def list_companies(current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    return db.query(Company).filter(Company.company_id == current.company_id).all()


@router.get("/companies/{company_id}", response_model=CompanyOut, summary="Get company")
def get_company(company_id: str, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only access your company")
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.patch("/companies/{company_id}", response_model=CompanyOut, summary="Update company")
def update_company(company_id: str, payload: CompanyUpdate, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only update your company")
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.add(company)
    db.flush()
    return company


@router.delete("/companies/{company_id}", status_code=204, summary="Delete company")
def delete_company(company_id: str, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only delete your company")
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(company)
    return None


# --- Products ---
@router.post("/companies/{company_id}/products", response_model=ProductOut, summary="Create product")
def create_product(company_id: str, payload: ProductCreate, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only manage products for your company")
    product = Product(
        product_id=str(uuid4()),
        company_id=company_id,
        product_name=payload.product_name,
        third_party_id=payload.third_party_id,
        short_summary=payload.short_summary,
        added_at=payload.added_at,
    )
    db.add(product)
    db.flush()
    return product


@router.get("/companies/{company_id}/products", response_model=List[ProductOut], summary="List products")
def list_products(company_id: str, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only view products for your company")
    return db.query(Product).filter(Product.company_id == company_id).all()


@router.get("/companies/{company_id}/products/{product_id}", response_model=ProductOut, summary="Get product")
def get_product(company_id: str, product_id: str, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only view products for your company")
    product = db.get(Product, product_id)
    if not product or product.company_id != company_id:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/companies/{company_id}/products/{product_id}", response_model=ProductOut, summary="Update product")
def update_product(company_id: str, product_id: str, payload: ProductUpdate, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only update products for your company")
    product = db.get(Product, product_id)
    if not product or product.company_id != company_id:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.add(product)
    db.flush()
    return product


@router.delete("/companies/{company_id}/products/{product_id}", status_code=204, summary="Delete product")
def delete_product(company_id: str, product_id: str, current: CurrentUser = Depends(require_company_user), db: Session = Depends(get_db)):
    if current.company_id != company_id:
        raise HTTPException(status_code=403, detail="Can only delete products for your company")
    product = db.get(Product, product_id)
    if not product or product.company_id != company_id:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    return None
