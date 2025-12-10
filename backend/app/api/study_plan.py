"""
Study plan generation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from ..core.database import get_db
from ..models.study_plan import StudyPlan
from ..services.llm_service import LLMService
from ..api.schemas import StudyPlanRequest, StudyPlanResponse


router = APIRouter(prefix="/study-plan", tags=["study-plan"])
llm_service = LLMService()


@router.post("/", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_study_plan(
    request: StudyPlanRequest,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Generate a personalized study plan
    
    - Based on syllabus, difficulty, and timeline
    - Creates daily and weekly breakdown
    - Optimized study schedule
    """
    # Calculate total days
    total_days = (request.exam_date - request.start_date).days
    
    if total_days <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam date must be after start date"
        )
    
    try:
        # Generate study plan using LLM
        plan_data = llm_service.generate_study_plan(
            syllabus=request.syllabus,
            total_days=total_days,
            difficulty=request.difficulty_level,
            daily_hours=request.daily_hours
        )
        
        if "error" in plan_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=plan_data.get("error", "Failed to generate study plan")
            )
        
        # Create database record
        study_plan = StudyPlan(
            user_id=user_id,
            title=request.title,
            syllabus=request.syllabus,
            difficulty_level=request.difficulty_level,
            start_date=request.start_date,
            exam_date=request.exam_date,
            total_days=total_days,
            daily_plan=json.dumps(plan_data.get("key_dates", [])),
            weekly_plan=json.dumps(plan_data.get("weekly_breakdown", []))
        )
        
        db.add(study_plan)
        db.commit()
        db.refresh(study_plan)
        
        return study_plan
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create study plan: {str(e)}"
        )


@router.get("/", response_model=List[StudyPlanResponse])
async def get_study_plans(
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Get all study plans for the current user
    """
    plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == user_id
    ).order_by(StudyPlan.created_at.desc()).all()
    
    return plans


@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Get a specific study plan by ID
    """
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == user_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_study_plan(
    plan_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Delete a study plan
    """
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == user_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study plan not found"
        )
    
    db.delete(plan)
    db.commit()
    
    return None
