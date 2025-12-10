"""
Document model for storing uploaded PDFs metadata
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Document(Base):
    """Document table for PDF uploads and metadata"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)  # in bytes
    
    # Content metadata
    total_pages = Column(Integer)
    total_chunks = Column(Integer)
    
    # ChromaDB collection ID
    collection_name = Column(String, unique=True, index=True)
    
    # Extracted text preview
    text_preview = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="documents")
