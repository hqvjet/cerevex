from __future__ import annotations

from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response

from schemas import PredictInput, PredictOutput, ContentComment, TitleContentComment
from controllers import invoke
from preprocessing.word_segment import label_mapping


router = APIRouter()


@router.post("/", response_model=PredictOutput, summary="Predict the inputs")
def predict(payload: PredictInput, response: Response):
    comments = payload.comments
    if type(comments[0]) == ContentComment:
        comments = [comment.content for comment in comments]
    elif type(comments[0]) == TitleContentComment:
        comments = [(comment.title, comment.content) for comment in comments]

    
    labels = invoke(payload=comments)
    labels = [label_mapping[label] for label in labels]

    return PredictOutput(predicted_labels=labels)