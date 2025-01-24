# app/models/schemas.py
from pydantic import BaseModel
from typing import List, Dict, Optional

class ProcessingStats(BaseModel):
    file_name: str
    chunks: int
    pages: int
    timestamp: str

class QuestionRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5
    score_threshold: Optional[float] = 0.3

class SearchResult(BaseModel):
    text: str
    score: float

class AnswerResponse(BaseModel):
    answer: str
    # sources: List[SearchResult]