from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi import status
from typing import List, Optional
from uuid import uuid4
from sqlalchemy.orm import Session

from database import get_db
from models import AnalysisReport
from deps import require_data_analyst

from core.ai_client import get_ai_client, AIClient
from model.schemas import (
    CommentsPayload,
    FileAnalysisResult,
    CommentsAnalysisResult,
    ProductInsight,
    AnalysisReportOut,
)
from utils.analytics import (
    avg_length,
    compute_label_distribution,
    pick_examples,
    buy_recommendation_from_distribution,
)
from utils.file_ingest import _read_any, validate_and_extract, SchemaError

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.get("/reports", response_model=List[AnalysisReportOut], summary="List analysis reports of current user (data_analyst only)")
def list_reports(
    claims=Depends(require_data_analyst),
    db: Session = Depends(get_db),
):
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    rows = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.user_id == user_id)
        .order_by(AnalysisReport.created_at.desc())
        .all()
    )
    return [
        AnalysisReportOut(
            report_id=r.report_id,
            num_positive=r.num_positive,
            num_neutral=r.num_neutral,
            num_negative=r.num_negative,
            short_summary=r.short_summary,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/files", response_model=FileAnalysisResult, summary="Analyze uploaded files (data_analyst only)")
async def analyze_files(
    files: List[UploadFile] = File(...),
    ai: AIClient = Depends(get_ai_client),
    _claims=Depends(require_data_analyst),
    db: Session = Depends(get_db),
):
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
    # Persist summary into analysis_reports
    try:
        # Normalize keys to lower for aggregation
        lower_dist = {k.lower(): v for k, v in dist.items()}
        pos = sum(lower_dist.get(k, 0) for k in ["positive", "pos", "good", "+"])
        neg = sum(lower_dist.get(k, 0) for k in ["negative", "neg", "bad", "-"])
        neu = sum(lower_dist.get(k, 0) for k in ["neutral", "neu", "=", "middle"])
        rep = AnalysisReport(
            report_id=str(uuid4()),
            user_id=_claims.get("sub"),
            num_positive=pos,
            num_neutral=neu,
            num_negative=neg,
            short_summary=f"Rows:{len(contents)} Dist:{dist} AvgLen:{result.avg_content_len:.1f}",
        )
        db.add(rep)
        db.flush()
    except Exception:
        pass
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


@router.post("/public-product-insight", response_model=ProductInsight, summary="Public product insight (no auth)")
async def public_product_insight(payload: CommentsPayload, ai: AIClient = Depends(get_ai_client)):
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
        positive_labels=["positive", "pos", "good", "+"],
        negative_labels=["negative", "neg", "bad", "-"],
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
