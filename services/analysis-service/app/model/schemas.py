from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class Comment(BaseModel):
    content: str = Field(..., description="Comment content")
    title: Optional[str] = Field(None, description="Optional title")


class CommentsPayload(BaseModel):
    comments: List[Comment]


class AnalyzedItem(BaseModel):
    content: str
    title: Optional[str] = None
    label: str


class FileAnalysisResult(BaseModel):
    total_rows: int
    with_title: int
    without_title: int
    avg_content_len: float
    label_distribution: Dict[str, int]
    items: List[AnalyzedItem] = Field(default_factory=list)


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


class AnalysisReportOut(BaseModel):
    report_id: str
    num_positive: int
    num_neutral: int
    num_negative: int
    short_summary: str
    created_at: datetime
