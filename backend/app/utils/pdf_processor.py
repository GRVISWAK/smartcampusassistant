"""
PDF processing utilities: text extraction and chunking
"""
import PyPDF2
from typing import List, Dict
import re


class PDFProcessor:
    """Handle PDF text extraction and chunking"""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize PDF processor
        
        Args:
            chunk_size: Maximum characters per chunk
            chunk_overlap: Overlap between consecutive chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text(self, pdf_path: str) -> Dict[str, any]:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary with extracted text and metadata
        """
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                # Extract text from all pages
                full_text = ""
                page_texts = []
                
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    page_texts.append({
                        "page_number": page_num + 1,
                        "text": page_text,
                        "char_count": len(page_text)
                    })
                    full_text += page_text + "\n\n"
                
                return {
                    "success": True,
                    "total_pages": total_pages,
                    "full_text": full_text,
                    "page_texts": page_texts,
                    "total_chars": len(full_text)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def clean_text(self, text: str) -> str:
        """
        Clean extracted text (remove extra whitespace, special chars)
        
        Args:
            text: Raw text to clean
            
        Returns:
            Cleaned text
        """
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-\']', '', text)
        
        # Strip whitespace
        text = text.strip()
        
        return text
    
    def create_chunks(self, text: str) -> List[Dict[str, any]]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Text to chunk
            
        Returns:
            List of chunk dictionaries with metadata
        """
        # Clean the text first
        text = self.clean_text(text)
        
        chunks = []
        start = 0
        chunk_id = 0
        
        while start < len(text):
            # Calculate end position
            end = start + self.chunk_size
            
            # If not at the end, try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                for char in ['. ', '! ', '? ', '\n']:
                    last_sentence = text.rfind(char, start, end)
                    if last_sentence != -1:
                        end = last_sentence + 1
                        break
            
            chunk_text = text[start:end].strip()
            
            if chunk_text:  # Only add non-empty chunks
                chunks.append({
                    "chunk_id": chunk_id,
                    "text": chunk_text,
                    "start_char": start,
                    "end_char": end,
                    "char_count": len(chunk_text)
                })
                chunk_id += 1
            
            # Move to next chunk with overlap
            start = end - self.chunk_overlap
        
        return chunks
    
    def create_page_chunks(self, page_texts: List[Dict]) -> List[Dict[str, any]]:
        """
        Create chunks from page-wise text
        
        Args:
            page_texts: List of page text dictionaries
            
        Returns:
            List of chunks with page information
        """
        all_chunks = []
        
        for page in page_texts:
            page_chunks = self.create_chunks(page["text"])
            
            # Add page metadata to each chunk
            for chunk in page_chunks:
                chunk["page_number"] = page["page_number"]
                all_chunks.append(chunk)
        
        return all_chunks
