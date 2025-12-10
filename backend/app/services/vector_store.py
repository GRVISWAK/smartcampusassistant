"""
Simple vector storage using numpy and cosine similarity
"""
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
from ..core.config import settings
import uuid


class VectorStore:
    """Manage vector storage and retrieval using numpy"""
    
    def __init__(self):
        """Initialize embedding model and storage"""
        # Initialize embedding model
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        
        # Storage for collections
        self.collections = {}
        
        # Ensure storage directory exists
        os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
    
    def create_collection(self, collection_name: str) -> str:
        """
        Create a new collection for a document
        
        Args:
            collection_name: Unique name for the collection
            
        Returns:
            Collection name
        """
        try:
            # Initialize empty collection
            self.collections[collection_name] = {
                'embeddings': [],
                'documents': [],
                'metadatas': []
            }
            
            return collection_name
        except Exception as e:
            raise Exception(f"Failed to create collection: {str(e)}")
    
    def add_chunks(
        self,
        collection_name: str,
        chunks: List[Dict],
        metadata: Optional[Dict] = None
    ) -> int:
        """
        Add text chunks to a collection
        
        Args:
            collection_name: Name of the collection
            chunks: List of chunk dictionaries
            metadata: Additional metadata to store
            
        Returns:
            Number of chunks added
        """
        try:
            if collection_name not in self.collections:
                raise ValueError(f"Collection {collection_name} not found")
            
            collection = self.collections[collection_name]
            
            # Extract texts
            texts = [chunk["text"] for chunk in chunks]
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(texts)
            
            # Store embeddings and data
            for i, chunk in enumerate(chunks):
                collection['embeddings'].append(embeddings[i])
                collection['documents'].append(chunk["text"])
                
                # Build metadata
                meta = {
                    "chunk_id": chunk.get("chunk_id", 0),
                    "page_number": chunk.get("page_number", 0),
                    "char_count": chunk.get("char_count", len(chunk["text"]))
                }
                
                if metadata:
                    meta.update(metadata)
                
                collection['metadatas'].append(meta)
            
            # Save to disk
            self._save_collection(collection_name)
            
            return len(chunks)
            
        except Exception as e:
            raise Exception(f"Failed to add chunks: {str(e)}")
    
    def query(
        self,
        collection_name: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict:
        """
        Query the vector store for similar chunks
        
        Args:
            collection_name: Name of the collection to query
            query_text: Text to search for
            n_results: Number of results to return
            
        Returns:
            Query results with documents and metadata
        """
        try:
            # Load collection if not in memory
            if collection_name not in self.collections:
                self._load_collection(collection_name)
            
            collection = self.collections[collection_name]
            
            if not collection['embeddings']:
                return {
                    "documents": [],
                    "metadatas": [],
                    "distances": [],
                    "count": 0
                }
            
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query_text])[0]
            
            # Calculate cosine similarity
            embeddings_array = np.array(collection['embeddings'])
            
            # Normalize
            query_norm = query_embedding / np.linalg.norm(query_embedding)
            embeddings_norm = embeddings_array / np.linalg.norm(embeddings_array, axis=1, keepdims=True)
            
            # Cosine similarity
            similarities = np.dot(embeddings_norm, query_norm)
            
            # Get top n results
            top_indices = np.argsort(similarities)[::-1][:n_results]
            
            # Format results
            documents = [collection['documents'][i] for i in top_indices]
            metadatas = [collection['metadatas'][i] for i in top_indices]
            distances = [float(1 - similarities[i]) for i in top_indices]  # Convert similarity to distance
            
            return {
                "documents": documents,
                "metadatas": metadatas,
                "distances": distances,
                "count": len(documents)
            }
            
        except Exception as e:
            raise Exception(f"Failed to query collection: {str(e)}")
    
    def get_collection_stats(self, collection_name: str) -> Dict:
        """
        Get statistics about a collection
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            Collection statistics
        """
        try:
            if collection_name not in self.collections:
                self._load_collection(collection_name)
            
            collection = self.collections[collection_name]
            count = len(collection['documents'])
            
            return {
                "name": collection_name,
                "count": count,
                "exists": True
            }
        except Exception as e:
            return {
                "name": collection_name,
                "count": 0,
                "exists": False,
                "error": str(e)
            }
    
    def delete_collection(self, collection_name: str) -> bool:
        """
        Delete a collection
        
        Args:
            collection_name: Name of collection to delete
            
        Returns:
            True if successful
        """
        try:
            # Remove from memory
            if collection_name in self.collections:
                del self.collections[collection_name]
            
            # Remove from disk
            file_path = os.path.join(settings.CHROMA_DB_PATH, f"{collection_name}.pkl")
            if os.path.exists(file_path):
                os.remove(file_path)
            
            return True
        except Exception as e:
            raise Exception(f"Failed to delete collection: {str(e)}")
    
    def _save_collection(self, collection_name: str):
        """Save collection to disk"""
        try:
            collection = self.collections[collection_name]
            file_path = os.path.join(settings.CHROMA_DB_PATH, f"{collection_name}.pkl")
            
            with open(file_path, 'wb') as f:
                pickle.dump(collection, f)
        except Exception as e:
            raise Exception(f"Failed to save collection: {str(e)}")
    
    def _load_collection(self, collection_name: str):
        """Load collection from disk"""
        try:
            file_path = os.path.join(settings.CHROMA_DB_PATH, f"{collection_name}.pkl")
            
            if not os.path.exists(file_path):
                raise ValueError(f"Collection {collection_name} not found")
            
            with open(file_path, 'rb') as f:
                self.collections[collection_name] = pickle.load(f)
        except Exception as e:
            raise Exception(f"Failed to load collection: {str(e)}")
