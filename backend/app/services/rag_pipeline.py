"""
RAG (Retrieval-Augmented Generation) Pipeline
Combines vector search with LLM for context-aware answers
"""
from typing import Optional, Dict, List
from .vector_store import VectorStore
from .llm_service import LLMService


class RAGPipeline:
    """RAG pipeline for context-aware question answering"""
    
    def __init__(self, llm_provider: Optional[str] = None):
        """
        Initialize RAG pipeline
        
        Args:
            llm_provider: LLM provider to use
        """
        self.vector_store = VectorStore()
        self.llm_service = LLMService(provider=llm_provider)
    
    def query(
        self,
        collection_name: str,
        question: str,
        n_results: int = 5,
        include_sources: bool = True,
        chat_history: list = None
    ) -> Dict:
        """
        Query document using RAG
        
        Args:
            collection_name: Document collection to query
            question: User's question
            n_results: Number of context chunks to retrieve
            include_sources: Whether to include source chunks
            
        Returns:
            Answer with sources and metadata
        """
        try:
            # Step 1: Retrieve relevant chunks from vector store
            search_results = self.vector_store.query(
                collection_name=collection_name,
                query_text=question,
                n_results=n_results
            )
            
            # Step 2: Build context from retrieved chunks
            context_chunks = search_results["documents"]
            context = "\n\n".join(context_chunks)
            
            # Step 2.5: Build conversation context if history exists
            conversation_context = ""
            if chat_history:
                conversation_context = "\n\nPrevious conversation:\n"
                for msg in chat_history[-6:]:  # Last 6 messages for context
                    role = msg.get('type', 'user')
                    content = msg.get('content', '')
                    if role == 'user':
                        conversation_context += f"Student: {content}\n"
                    else:
                        conversation_context += f"Assistant: {content}\n"
                conversation_context += "\n"
            
            # Step 3: Generate answer using LLM with context
            answer = self.llm_service.generate(
                prompt=f"""You are a helpful study assistant. Answer the student's question based on the provided context from their study materials.

Context from the document:
{context}{conversation_context}
Student's question: {question}

Provide a clear, accurate answer based on the context. If the context doesn't contain enough information to fully answer the question, acknowledge this and provide what information is available. If the student is asking a follow-up question, use the previous conversation to provide a more contextual answer.""",
                context="",
                max_tokens=4096,
                temperature=0.7
            )
            
            # Step 4: Format response
            response = {
                "answer": answer,
                "question": question,
                "sources_count": search_results["count"]
            }
            
            # Include source chunks if requested
            if include_sources:
                sources = []
                for i, (doc, meta, dist) in enumerate(zip(
                    search_results["documents"],
                    search_results["metadatas"],
                    search_results["distances"]
                )):
                    sources.append({
                        "chunk_text": doc[:200] + "..." if len(doc) > 200 else doc,
                        "page_number": meta.get("page_number", "N/A"),
                        "relevance_score": round(1 - dist, 3),  # Convert distance to similarity
                        "chunk_id": meta.get("chunk_id", i)
                    })
                
                response["sources"] = sources
            
            return response
            
        except Exception as e:
            return {
                "error": str(e),
                "answer": "Failed to generate answer",
                "question": question
            }
    
    def generate_summary(
        self,
        collection_name: str,
        summary_type: str = "concise",
        page_number: Optional[int] = None
    ) -> Dict:
        """
        Generate summary from document
        
        Args:
            collection_name: Document collection
            summary_type: Type of summary
            page_number: Specific page to summarize (None for full doc)
            
        Returns:
            Summary response
        """
        try:
            # Get collection stats to determine how much content we have
            stats = self.vector_store.get_collection_stats(collection_name)
            
            # Retrieve chunks (all if full summary, or page-specific)
            if page_number:
                # This would require filtering by page - simplified for MVP
                search_results = self.vector_store.query(
                    collection_name=collection_name,
                    query_text=f"page {page_number} content summary",
                    n_results=10
                )
            else:
                # Get representative chunks for full document
                search_results = self.vector_store.query(
                    collection_name=collection_name,
                    query_text="main topics and key points",
                    n_results=15
                )
            
            # Combine chunks
            text_to_summarize = "\n\n".join(search_results["documents"])
            
            # Generate summary
            summary = self.llm_service.generate_summary(
                text=text_to_summarize,
                summary_type=summary_type
            )
            
            return {
                "summary": summary,
                "summary_type": summary_type,
                "page_number": page_number,
                "chunks_used": search_results["count"]
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "summary": "Failed to generate summary"
            }
    
    def generate_quiz(
        self,
        collection_name: str,
        num_questions: int = 5,
        difficulty: str = "medium",
        topic: Optional[str] = None,
        question_types: Optional[List[str]] = None
    ) -> Dict:
        """
        Generate quiz from document content
        
        Args:
            collection_name: Document collection
            num_questions: Number of questions
            difficulty: Difficulty level
            topic: Specific topic to focus on (optional)
            
        Returns:
            Quiz questions
        """
        try:
            # Retrieve relevant content
            query_text = topic if topic else "key concepts and important information"
            search_results = self.vector_store.query(
                collection_name=collection_name,
                query_text=query_text,
                n_results=10
            )
            
            # Combine chunks
            content = "\n\n".join(search_results["documents"])
            
            # Generate quiz
            quiz = self.llm_service.generate_quiz(
                text=content,
                num_questions=num_questions,
                difficulty=difficulty,
                question_types=question_types
            )
            
            quiz["metadata"] = {
                "collection": collection_name,
                "difficulty": difficulty,
                "topic": topic
            }
            
            return quiz
            
        except Exception as e:
            return {
                "error": str(e),
                "questions": []
            }
