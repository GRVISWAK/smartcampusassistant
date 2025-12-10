"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, date


# User schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Document schemas
class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    total_pages: int
    total_chunks: int
    collection_name: str
    text_preview: str
    created_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Chat/RAG schemas
class ChatRequest(BaseModel):
    document_id: int
    question: str
    include_sources: bool = True
    chat_history: Optional[List[Dict[str, str]]] = []


class ChatResponse(BaseModel):
    answer: str
    question: str
    sources_count: int
    sources: Optional[List[Dict]] = None


# Summary schemas
class SummaryRequest(BaseModel):
    document_id: int
    summary_type: str = Field(default="concise", pattern="^(concise|detailed|bullet_points)$")
    page_number: Optional[int] = None


class SummaryResponse(BaseModel):
    summary: str
    summary_type: str
    page_number: Optional[int]
    chunks_used: int


# Quiz schemas
class QuizRequest(BaseModel):
    document_id: int
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    topic: Optional[str] = None
    question_types: Optional[List[str]] = Field(default=None, description="Types: mcq, fill_blank, short_answer, or mix for all")


class QuizResponse(BaseModel):
    questions: List[Dict]
    metadata: Optional[Dict] = None


# Study Plan schemas
class StudyPlanRequest(BaseModel):
    title: str
    syllabus: str
    difficulty_level: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    start_date: date
    exam_date: date
    daily_hours: int = Field(default=2, ge=1, le=12)


class StudyPlanResponse(BaseModel):
    id: int
    title: str
    syllabus: str
    difficulty_level: str
    start_date: date
    exam_date: date
    total_days: int
    daily_plan: str
    weekly_plan: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Error response
class ErrorResponse(BaseModel):
    detail: str
    error: Optional[str] = None
