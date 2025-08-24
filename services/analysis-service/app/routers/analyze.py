from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi import status
from typing import List, Optional

from core.ai_client import get_ai_client, AIClient
from models.schemas import (
    CommentsPayload,
    FileAnalysisResult,
    CommentsAnalysisResult,
    ProductInsight,
)
from utils.analytics import (
    avg_length,
    compute_label_distribution,
    pick_examples,
    buy_recommendation_from_distribution,
)
from utils.file_ingest import _read_any, validate_and_extract, SchemaError

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/files", response_model=FileAnalysisResult)
async def analyze_files(files: List[UploadFile] = File(...), ai: AIClient = Depends(get_ai_client)):
    titles: List[Optional[str]] = []
    contents: List[str] = []

    for f in files:
        try:
            data = await f.read()
            df = _read_any(data, f.filename or "uploaded")
            t, c = validate_and_extract(df)
            titles.extend(t)
            contents.extend(c)
        except SchemaError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to parse {f.filename}: {e}")

    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid rows found")

    request_items = []
    for t, c in zip(titles, contents):
        item = {"content": c}
        if t:
            item["title"] = t
        request_items.append(item)
    labels = await ai.predict(request_items)
    if len(labels) != len(contents):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service returned mismatched labels length")

    dist = compute_label_distribution(labels)
    # Pair items with labels so frontend can render tables per tab
    items = []
    for idx, (t, c) in enumerate(zip(titles, contents)):
        items.append({
            "content": c,
            "title": t,
            "label": labels[idx],
        })

    result: FileAnalysisResult = FileAnalysisResult(
        total_rows=len(contents),
        with_title=sum(1 for t in titles if t),
        without_title=sum(1 for t in titles if not t),
        avg_content_len=avg_length(contents),
        label_distribution=dist,
        items=items,
    )
    return result


@router.post("/comments", response_model=CommentsAnalysisResult)
async def analyze_comments(payload: CommentsPayload, ai: AIClient = Depends(get_ai_client)):
    comments = payload.comments
    if not comments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No comments provided")

    req = [c.dict(exclude_none=True) for c in comments]
    labels = await ai.predict(req)
    if len(labels) != len(comments):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service returned mismatched labels length")
    contents = [c.content for c in comments]
    dist = compute_label_distribution(labels)
    return CommentsAnalysisResult(
        total=len(comments),
        avg_content_len=avg_length(contents),
        label_distribution=dist,
        labels=labels,
    )


@router.post("/product-insights", response_model=ProductInsight)
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

    total = len(comments)
    avg_len = avg_length(contents)
    rec, conf = buy_recommendation_from_distribution(dist)
    pos_examples, neg_examples = pick_examples(
        contents,
        labels,
        positive_labels=["positive", "good", "+"],
        negative_labels=["negative", "bad", "-"],
    )

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
