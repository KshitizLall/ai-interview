from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "InterviewBot API"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # CORS Settings - Updated for production
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://ai-interview-black-gamma.vercel.app",  # Current Vercel deployment
        "https://*.vercel.app",  # All Vercel preview deployments
        "https://*.onrender.com"  # Allow all Render domains for development
    ]
    
    # OpenAI Settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".docx", ".txt"]
    UPLOAD_DIR: str = "uploads"
    EXPORT_DIR: str = "exports"
    
    # Database Settings (for future use)
    DATABASE_URL: str = "sqlite:///./interview_prep.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()