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
        "https://ai-interview-frontend-nu.vercel.app",  # Current Vercel deployment
    ]
    
    # CORS regex pattern for Vercel preview deployments
    ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    
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

    # MongoDB (Atlas) - used for auth / user storage
    MONGO_URI: str = "mongodb+srv://shivamjain169_db_user:dUxvRTypp4xkfbUz@ai-interview.s34qp5q.mongodb.net/?retryWrites=true&w=majority&appName=AI-INTERVIEW"
    
    # JWT settings
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_SECONDS: int = 3600  # 1 hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()