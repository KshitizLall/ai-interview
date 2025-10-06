from pydantic_settings import BaseSettings
from typing import List
import secrets
import os

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "InterviewBot API"
    DEBUG: bool = False  # Default to False for security
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
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

    # JWT settings - Enhanced security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes for access tokens
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days for refresh tokens
    JWT_ISSUER: str = "InterviewBot-API"
    JWT_AUDIENCE: str = "InterviewBot-Users"
    
    # Password Security
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGITS: bool = True
    PASSWORD_REQUIRE_SYMBOLS: bool = True
    PASSWORD_MAX_LENGTH: int = 128
    
    # Rate Limiting
    RATE_LIMIT_LOGIN: str = "5/minute"    # 5 login attempts per minute
    RATE_LIMIT_SIGNUP: str = "3/minute"   # 3 signup attempts per minute
    RATE_LIMIT_GENERAL: str = "100/minute"  # General API calls
    
    # Security Settings
    BCRYPT_ROUNDS: int = 12  # Higher rounds for better security
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()