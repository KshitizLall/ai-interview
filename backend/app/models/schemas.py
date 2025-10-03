from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    EXPERIENCE = "experience"
    PROBLEM_SOLVING = "problem-solving"
    LEADERSHIP = "leadership"
    SITUATIONAL = "situational"
    COMPANY_CULTURE = "company-culture"
    GENERAL = "general"

class QuestionDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class GenerationMode(str, Enum):
    RESUME = "resume"
    JOB_DESCRIPTION = "jd"
    COMBINED = "combined"

# File Upload Models
class FileUploadResponse(BaseModel):
    filename: str
    file_size: int
    content: str
    word_count: int
    character_count: int
    processing_time: float

# Question Models
class Question(BaseModel):
    id: str
    question: str
    type: QuestionType
    difficulty: QuestionDifficulty
    relevance_score: float
    answer: Optional[str] = None
    created_at: datetime = datetime.now()

class GenerationOptions(BaseModel):
    mode: GenerationMode
    count: int = 10
    include_answers: bool = False
    question_types: Optional[List[QuestionType]] = None
    difficulty_levels: Optional[List[QuestionDifficulty]] = None
    focus_areas: Optional[List[str]] = None
    company_name: Optional[str] = None
    position_level: Optional[str] = None

class QuestionGenerationRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    mode: GenerationMode
    question_count: int = 10
    include_answers: bool = False
    question_types: Optional[List[QuestionType]] = None
    difficulty_levels: Optional[List[QuestionDifficulty]] = None
    focus_areas: Optional[List[str]] = None
    company_name: Optional[str] = None
    position_level: Optional[str] = None

class QuestionGenerationResponse(BaseModel):
    questions: List[Question]
    generation_time: float
    total_questions: int

# Answer Models
class AnswerGenerationRequest(BaseModel):
    question: str
    resume_text: Optional[str] = None
    job_description: Optional[str] = None

class AnswerGenerationResponse(BaseModel):
    question: str
    answer: str
    generation_time: float

class BulkAnswerGenerationRequest(BaseModel):
    questions: List[Question]
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    answer_style: Optional[str] = "professional"  # professional, conversational, detailed, concise

class BulkAnswerGenerationResponse(BaseModel):
    answers: Dict[str, str]  # question_id -> answer
    generation_time: float
    total_answers: int

# PDF Export Models
class PDFExportOptions(BaseModel):
    include_analytics: bool = True
    include_tips: bool = True
    color_scheme: str = "professional"  # professional, minimal, modern
    page_layout: str = "executive"  # compact, spacious, executive

class PDFExportRequest(BaseModel):
    questions: List[Question]
    answers: Dict[str, str]
    resume_filename: Optional[str] = None
    job_title: Optional[str] = None
    export_options: Optional[PDFExportOptions] = PDFExportOptions()

class PDFExportResponse(BaseModel):
    filename: str
    download_url: str
    file_size: int
    generation_time: float

# User / Auth Models
class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str


class UserInDB(BaseModel):
    id: Optional[str]
    name: Optional[str] = None
    email: str
    password_hash: str
    tokens: Optional[List[str]] = []
    credits: int = 50  # Default credits for new users
    sessions: List[str] = []  # Session IDs
    usage_stats: Dict[str, Any] = {}  # Track usage patterns
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UserPublic(BaseModel):
    id: Optional[str]
    name: Optional[str] = None
    email: str
    credits: int
    sessions: List[str] = []
    created_at: datetime


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LogoutResponse(BaseModel):
    detail: str


class CreditCheckRequest(BaseModel):
    operation: str  # "generate_questions", "generate_answer", etc.
    cost: int = 1


class CreditCheckResponse(BaseModel):
    has_credits: bool
    current_credits: int
    required_credits: int


class CreditDeductRequest(BaseModel):
    operation: str
    cost: int = 1


class CreditDeductResponse(BaseModel):
    success: bool
    new_credit_balance: int

# Session Management Models
class InterviewSession(BaseModel):
    id: Optional[str] = None
    user_id: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    questions: List[Question] = []
    answers: Dict[str, str] = {}
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    is_active: bool = True


class SessionCreate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    job_description: Optional[str] = None


class SessionUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    questions: Optional[List[Question]] = None
    answers: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None


class SessionListResponse(BaseModel):
    sessions: List[InterviewSession]
    total_sessions: int


class SessionResponse(BaseModel):
    session: InterviewSession


class SessionStatsResponse(BaseModel):
    total_questions: int
    answered_questions: int
    completion_percentage: float
    last_updated: datetime


# Anonymous User Limits
class AnonymousUsageLimits(BaseModel):
    questions_generated: int = 0
    answers_generated: int = 0
    max_questions: int = 10
    max_answers: int = 10


class UsageCheckRequest(BaseModel):
    operation: str  # "generate_questions", "generate_answer"
    is_authenticated: bool = False
    anonymous_usage: Optional[AnonymousUsageLimits] = None


class UsageCheckResponse(BaseModel):
    allowed: bool
    remaining_quota: int
    message: Optional[str] = None


# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
