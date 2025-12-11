"""
Chat and RAG endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.document_service import DocumentService
from ..services.rag_pipeline import RAGPipeline
from ..api.schemas import ChatRequest, ChatResponse


router = APIRouter(prefix="/chat", tags=["chat"])
document_service = DocumentService()
rag_pipeline = RAGPipeline()


@router.post("/", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """
    Ask questions about a document using RAG
    
    - Retrieves relevant context from the document
    - Generates contextual answer using LLM
    - Returns answer with source references
    """
    # Verify document belongs to user
    document = document_service.get_document(request.document_id, user_id, db)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Query using RAG pipeline with conversation history
        response = rag_pipeline.query(
            collection_name=document.collection_name,
            question=request.question,
            n_results=5,
            include_sources=request.include_sources,
            chat_history=request.chat_history
        )
        
        if "error" in response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response["error"]
            )
        
        return response
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Chat error: {error_details}")  # Print to console for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process question: {str(e)}"
        )
