from __future__ import annotations

from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from deps import require_company_admin, get_current_user
from models import User
from roles import (
    ROLE_COMPANY_ADMIN,
    ROLE_USER,
    ensure_allowed_roles,
    has_role,
    normalize_role_string,
    parse_roles,
    serialize_roles,
)
from schemas import CompanyUserCreate, CompanyUserOut, CompanyUserUpdateRoles
from security import hash_password, http_bearer


router = APIRouter(dependencies=[Depends(http_bearer)])


def _to_company_user_out(u: User) -> CompanyUserOut:
    return CompanyUserOut(
        user_id=u.user_id,
        email=u.email,
        roles=parse_roles(u.role),
        role=u.role,
        company_id=u.company_id,
        created_at=u.created_at,
    )


@router.get("/admin-email", summary="Get company_admin email for my company (any company member)" )
def get_company_admin_email(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    if not user.company_id:
        raise HTTPException(status_code=409, detail="User has no company")
    admin = (
        db.query(User)
        .filter(User.company_id == user.company_id)
        .filter(User.role.like(f"%{ROLE_COMPANY_ADMIN}%"))
        .order_by(User.created_at.asc())
        .first()
    )
    if not admin:
        raise HTTPException(status_code=404, detail="company_admin not found")
    return {"company_id": user.company_id, "company_admin_email": admin.email}


@router.post("/users", response_model=CompanyUserOut, summary="company_admin: Create user in my company (assign roles)")
def company_add_user(
    payload: CompanyUserCreate,
    admin: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    # Validate roles and normalize
    try:
        roles = ensure_allowed_roles(payload.roles)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Email uniqueness
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")

    user = User(
        user_id=str(uuid4()),
        email=payload.email,
        password=hash_password(payload.password),
        role=serialize_roles(roles),
        company_id=admin.company_id,
    )
    db.add(user)
    db.flush()
    return _to_company_user_out(user)


@router.get("/users", response_model=List[CompanyUserOut], summary="company_admin: List users in my company (with roles)")
def company_list_users(
    admin: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.company_id == admin.company_id)
        .order_by(User.created_at.desc())
        .all()
    )
    return [_to_company_user_out(u) for u in users]


@router.delete("/users/{user_id}", status_code=204, summary="company_admin: Remove a user from my company (detaches and demotes to 'user')")
def company_remove_user(
    user_id: str,
    admin: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    if user_id == admin.user_id:
        # Allow self-remove? It's safer to block to avoid orphaned companies
        raise HTTPException(status_code=400, detail="Admin cannot remove themselves")

    user = db.get(User, user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")
    # Prevent removing the last company_admin
    if has_role(user.role, ROLE_COMPANY_ADMIN):
        others = (
            db.query(User)
            .filter(User.company_id == admin.company_id, User.user_id != user.user_id)
            .all()
        )
        others_have_admin = any(has_role(u.role, ROLE_COMPANY_ADMIN) for u in others)
        if not others_have_admin:
            raise HTTPException(status_code=400, detail="Cannot remove the last company_admin from the company")

    # Detach from company and demote roles to 'user'
    user.company_id = None
    user.role = serialize_roles([ROLE_USER])
    db.add(user)
    db.flush()
    return None


@router.patch("/users/{user_id}/roles", response_model=CompanyUserOut, summary="company_admin: Update a user's roles in my company")
def company_update_user_roles(
    user_id: str,
    payload: CompanyUserUpdateRoles,
    admin: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")

    # Validate roles and normalize
    try:
        new_roles = ensure_allowed_roles(payload.roles)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Prevent demoting the last company_admin in the company
    if has_role(user.role, ROLE_COMPANY_ADMIN) and ROLE_COMPANY_ADMIN not in new_roles:
        # Check if there is at least one other company_admin in the same company
        count_admins = (
            db.query(User)
            .filter(
                User.company_id == admin.company_id,
                User.user_id != user.user_id,
            )
            .all()
        )
        others_have_admin = any(has_role(u.role, ROLE_COMPANY_ADMIN) for u in count_admins)
        if not others_have_admin:
            raise HTTPException(status_code=400, detail="Cannot remove the last company_admin from the company")

    user.role = serialize_roles(new_roles)
    db.add(user)
    db.flush()
    return _to_company_user_out(user)
