"""
Study Plan model for personalized learning schedules
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class StudyPlan(Base):
    """Study plan table for personalized schedules"""
    __tablename__ = "study_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Plan details
    title = Column(String, nullable=False)
    syllabus = Column(Text)  # Topics to cover
    difficulty_level = Column(String)  # easy, medium, hard
    
    # Timeline
    start_date = Column(Date)
    exam_date = Column(Date)
    total_days = Column(Integer)
    
    # Generated plan
    daily_plan = Column(Text)  # JSON string with daily breakdown
    weekly_plan = Column(Text)  # JSON string with weekly summary
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="study_plans")
