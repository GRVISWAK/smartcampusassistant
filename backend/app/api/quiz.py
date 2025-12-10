"""
Quiz generation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from ..core.database import get_db
from ..services.document_service import DocumentService
from ..services.rag_pipeline import RAGPipeline
from ..services.llm_service import LLMService
from ..api.schemas import QuizRequest, QuizResponse


router = APIRouter(prefix="/quiz", tags=["quiz"])
document_service = DocumentService()
rag_pipeline = RAGPipeline()
llm_service = LLMService()


class GradeAnswerRequest(BaseModel):
    user_answer: str
    expected_answer: str
    key_points: List[str]
    question: str


class GradeAnswerResponse(BaseModel):
    score: float
    feedback: str
    points_covered: List[str]
    points_missed: List[str]


@router.post("/", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Generate quiz questions from a document
    
    - Creates multiple choice, fill-in-the-blank, and short answer questions
    - Adjustable difficulty level
    - Can focus on specific topics
    """
    # Verify document belongs to user
    document = document_service.get_document(request.document_id, user_id, db)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Generate quiz using RAG pipeline
        response = rag_pipeline.generate_quiz(
            collection_name=document.collection_name,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            topic=request.topic,
            question_types=request.question_types
        )
        
        if "error" in response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.get("error", "Failed to generate quiz")
            )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.post("/grade", response_model=GradeAnswerResponse)
async def grade_short_answer(request: GradeAnswerRequest):
    """
    Grade a short answer question using AI
    
    Returns a score (0-100) and detailed feedback
    """
    try:
        prompt = f"""You are grading a short answer question. Evaluate the student's answer and provide a score.

Question: {request.question}

Expected Answer: {request.expected_answer}

Key Points to Cover:
{chr(10).join(f"- {point}" for point in request.key_points)}

Student's Answer: {request.user_answer}

Provide your evaluation in JSON format:
{{
    "score": <number from 0-100>,
    "feedback": "<brief feedback on the answer>",
    "points_covered": ["<key points that were covered>"],
    "points_missed": ["<key points that were missed>"]
}}

Be fair but strict. Award full points if all key concepts are covered even if wording differs."""

        response = llm_service.generate(prompt, max_tokens=500, temperature=0.3)
        
        # Parse JSON response
        import json
        import re
        
        # Remove markdown code blocks if present
        cleaned_response = response.strip()
        if cleaned_response.startswith('```'):
            match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned_response, re.DOTALL)
            if match:
                cleaned_response = match.group(1).strip()
        
        # Extract JSON
        json_start = cleaned_response.find('{')
        json_end = cleaned_response.rfind('}') + 1
        if json_start != -1 and json_end > json_start:
            result = json.loads(cleaned_response[json_start:json_end])
            return result
        else:
            return {
                "score": 50,
                "feedback": "Could not grade automatically. Please review manually.",
                "points_covered": [],
                "points_missed": request.key_points
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade answer: {str(e)}"
        )
