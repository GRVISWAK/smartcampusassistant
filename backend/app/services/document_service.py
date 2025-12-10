"""
Document management service
Handles PDF upload, processing, and storage
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile
from ..models.document import Document
from ..utils.pdf_processor import PDFProcessor
from .vector_store import VectorStore
from ..core.config import settings


class DocumentService:
    """Service for document management"""
    
    def __init__(self):
        """Initialize document service"""
        self.pdf_processor = PDFProcessor()
        self.vector_store = VectorStore()
    
    async def upload_and_process(
        self,
        file: UploadFile,
        user_id: int,
        db: Session
    ) -> Document:
        """
        Upload PDF and process it
        
        Args:
            file: Uploaded PDF file
            user_id: User ID
            db: Database session
            
        Returns:
            Created document record
        """
        try:
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            file_size = len(content)
            
            # Extract text from PDF
            extraction_result = self.pdf_processor.extract_text(file_path)
            
            if not extraction_result["success"]:
                raise Exception(f"PDF extraction failed: {extraction_result['error']}")
            
            # Create chunks
            chunks = self.pdf_processor.create_page_chunks(
                extraction_result["page_texts"]
            )
            
            # Create collection in ChromaDB
            collection_name = f"doc_{uuid.uuid4().hex[:16]}"
            self.vector_store.create_collection(collection_name)
            
            # Add chunks to vector store
            self.vector_store.add_chunks(
                collection_name=collection_name,
                chunks=chunks,
                metadata={
                    "user_id": user_id,
                    "filename": file.filename
                }
            )
            
            # Create database record
            document = Document(
                user_id=user_id,
                filename=unique_filename,
                original_filename=file.filename,
                file_path=file_path,
                file_size=file_size,
                total_pages=extraction_result["total_pages"],
                total_chunks=len(chunks),
                collection_name=collection_name,
                text_preview=extraction_result["full_text"][:500],
                processed_at=datetime.utcnow()
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            return document
            
        except Exception as e:
            # Cleanup on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise Exception(f"Document upload failed: {str(e)}")
    
    def get_document(self, document_id: int, user_id: int, db: Session) -> Optional[Document]:
        """Get document by ID"""
        return db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
    
    def get_user_documents(self, user_id: int, db: Session) -> list:
        """Get all documents for a user"""
        return db.query(Document).filter(
            Document.user_id == user_id
        ).order_by(Document.created_at.desc()).all()
    
    def delete_document(self, document_id: int, user_id: int, db: Session) -> bool:
        """Delete document and associated data"""
        document = self.get_document(document_id, user_id, db)
        
        if not document:
            return False
        
        try:
            # Delete from vector store
            self.vector_store.delete_collection(document.collection_name)
            
            # Delete file
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
            
            # Delete from database
            db.delete(document)
            db.commit()
            
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"Document deletion failed: {str(e)}")
