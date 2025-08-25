from __future__ import annotations

from typing import List
from fastapi import APIRouter, HTTPException, Depends, status

# NOTE: This router is intentionally public (no auth dependency) so that the
# browser extension can call it directly. Consider adding lightweight rate limiting
# (e.g., via an API gateway, CDN edge rules, or custom middleware) to protect against abuse.

from core.ai_client import get_ai_client, AIClient
from models.schemas import CommentsPayload, ProductInsight
from utils.analytics import (
    avg_length,
    compute_label_distribution,
    pick_examples,
    buy_recommendation_from_distribution,
)

router = APIRouter(prefix="/insights", tags=["insights"], include_in_schema=False)


@router.get("/deprecated", include_in_schema=False)
async def deprecated():  # pragma: no cover - simple notice
    return {"detail": "Endpoint moved to /analyze/public-product-insight"}
