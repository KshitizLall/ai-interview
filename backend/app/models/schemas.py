from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    EXPERIENCE = "experience"

class QuestionDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

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

class QuestionGenerationRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description: Optional[str] = None
    mode: GenerationMode
    question_count: int = 10
    include_answers: bool = False

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

# PDF Export Models
class PDFExportRequest(BaseModel):
    questions: List[Question]
    answers: Dict[str, str]
    resume_filename: Optional[str] = None
    job_title: Optional[str] = None

class PDFExportResponse(BaseModel):
    filename: str
    download_url: str
    file_size: int
    generation_time: float

# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None