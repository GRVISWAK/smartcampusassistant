"""
Application configuration and settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "StudyPilot"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # LLM API Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str
    
    # ChromaDB
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # LLM Settings
    DEFAULT_LLM: str = "gemini"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
