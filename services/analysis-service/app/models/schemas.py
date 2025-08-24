from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Comment(BaseModel):
    content: str = Field(..., description="Comment content")
    title: Optional[str] = Field(None, description="Optional title")


class CommentsPayload(BaseModel):
    comments: List[Comment]


class FileAnalysisResult(BaseModel):
    total_rows: int
    with_title: int
    without_title: int
    avg_content_len: float
    label_distribution: Dict[str, int]
    labels: List[str]


class CommentsAnalysisResult(BaseModel):
    total: int
    avg_content_len: float
    label_distribution: Dict[str, int]
    labels: List[str]


class ProductInsight(BaseModel):
    summary: str
    buy_recommendation: str
    confidence: float
    top_positive_examples: List[str] = Field(default_factory=list)
    top_negative_examples: List[str] = Field(default_factory=list)
    label_distribution: Dict[str, int]
