from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "AI Interview Prep API"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # CORS Settings
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
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