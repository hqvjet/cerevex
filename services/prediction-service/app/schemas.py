from pydantic import BaseModel
from typing import List, Optional

class ContentComment(BaseModel):
    content: str

class TitleContentComment(BaseModel):
    title: str
    content: str

class PredictInput(BaseModel):
    comments: List[ContentComment | TitleContentComment]

class PredictOutput(BaseModel):
    predicted_labels: List[str]