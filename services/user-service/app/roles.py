from __future__ import annotations

from typing import Iterable


# Canonical role names
ROLE_USER = "user"
ROLE_COMPANY_ADMIN = "company_admin"
ROLE_DATA_ANALYST = "data_analyst"
ROLE_PRODUCT_INSIGHT_ANALYST = "product_insight_analyst"

ALLOWED_ROLES: set[str] = {
    ROLE_USER,
    ROLE_COMPANY_ADMIN,
    ROLE_DATA_ANALYST,
    ROLE_PRODUCT_INSIGHT_ANALYST,
}


def parse_roles(role_str: str | None) -> list[str]:
    roles = [r.strip() for r in (role_str or "").split(",")]
    return [r for r in roles if r]


def serialize_roles(roles: Iterable[str]) -> str:
    # Keep stable order: prioritize company_admin, then analysts, then user
    uniq = []
    seen = set()
    for r in roles:
        if r and r not in seen:
            seen.add(r)
            uniq.append(r)
    priority = [ROLE_COMPANY_ADMIN, ROLE_DATA_ANALYST, ROLE_PRODUCT_INSIGHT_ANALYST, ROLE_USER]
    uniq_sorted = [r for r in priority if r in uniq] + [r for r in uniq if r not in priority]
    return ",".join(uniq_sorted) if uniq_sorted else ROLE_USER


def has_role(role_str: str | None, role: str) -> bool:
    return role in set(parse_roles(role_str))


def ensure_allowed_roles(roles: Iterable[str]) -> list[str]:
    normalized: list[str] = []
    for r in roles:
        if r not in ALLOWED_ROLES:
            raise ValueError(f"Unsupported role: {r}")
        normalized.append(r)
    # Always ensure at least 'user' role
    if ROLE_USER not in normalized:
        normalized.append(ROLE_USER)
    return normalized


def normalize_role_string(role_str: str | None) -> str:
    roles = parse_roles(role_str)
    roles = ensure_allowed_roles(roles or [ROLE_USER])
    return serialize_roles(roles)
