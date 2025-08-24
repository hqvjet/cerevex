from __future__ import annotations

from typing import List
from fastapi import APIRouter, HTTPException, Depends, status

from core.ai_client import get_ai_client, AIClient
from models.schemas import CommentsPayload, ProductInsight
from utils.analytics import (
    avg_length,
    compute_label_distribution,
    pick_examples,
    buy_recommendation_from_distribution,
)

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/product", response_model=ProductInsight)
async def product_insight(payload: CommentsPayload, ai: AIClient = Depends(get_ai_client)):
    comments = payload.comments
    if not comments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No comments provided")

    req = [c.dict(exclude_none=True) for c in comments]
    labels = await ai.predict(req)
    if len(labels) != len(comments):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service returned mismatched labels length")
    contents = [c.content for c in comments]
    dist = compute_label_distribution(labels)

    # Build user-friendly summary
    total = len(comments)
    avg_len = avg_length(contents)
    rec, conf = buy_recommendation_from_distribution(dist)

    pos_examples, neg_examples = pick_examples(contents, labels, positive_labels=["positive", "good", "+"], negative_labels=["negative", "bad", "-"])

    summary = (
        f"Analyzed {total} reviews. Average length {avg_len} chars. "
        f"Sentiment distribution: {dist}."
    )

    return ProductInsight(
        summary=summary,
        buy_recommendation=rec,
        confidence=conf,
        top_positive_examples=pos_examples,
        top_negative_examples=neg_examples,
        label_distribution=dist,
    )
