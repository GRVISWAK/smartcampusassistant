"""
Summary generation endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.document_service import DocumentService
from ..services.rag_pipeline import RAGPipeline
from ..api.schemas import SummaryRequest, SummaryResponse


router = APIRouter(prefix="/summary", tags=["summary"])
document_service = DocumentService()
rag_pipeline = RAGPipeline()


@router.post("/", response_model=SummaryResponse)
async def generate_summary(
    request: SummaryRequest,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Generate summary of a document
    
    - Supports different summary types: concise, detailed, bullet_points
    - Can summarize entire document or specific page
    """
    # Verify document belongs to user
    document = document_service.get_document(request.document_id, user_id, db)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Validate page number if provided
    if request.page_number and request.page_number > document.total_pages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Page number exceeds document pages ({document.total_pages})"
        )
    
    try:
        # Generate summary using RAG pipeline
        response = rag_pipeline.generate_summary(
            collection_name=document.collection_name,
            summary_type=request.summary_type,
            page_number=request.page_number
        )
        
        if "error" in response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response["error"]
            )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
