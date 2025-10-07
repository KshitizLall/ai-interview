# Python Backend Clean Code and Folder Structure Guide

This guide provides a comprehensive approach to maintaining clean, maintainable, and scalable Python backend code for the InterviewBot API. Based on the current FastAPI architecture, these recommendations build on existing patterns while improving code quality, testability, and developer experience.

## Table of Contents
1. [Current Architecture Assessment](#1-current-architecture-assessment)
2. [Enhanced Folder Structure](#2-enhanced-folder-structure)
3. [Code Organization Principles](#3-code-organization-principles)
4. [Service Layer Improvements](#4-service-layer-improvements)
5. [Configuration Management](#5-configuration-management)
6. [Error Handling and Validation](#6-error-handling-and-validation)
7. [Testing Strategy](#7-testing-strategy)
8. [Performance and Optimization](#8-performance-and-optimization)
9. [Documentation and Code Quality](#9-documentation-and-code-quality)
10. [Development Workflow](#10-development-workflow)

## 1. Current Architecture Assessment

### Strengths
- ✅ Clear separation of concerns (API, Core, Models, Services)
- ✅ Proper FastAPI patterns with dependency injection
- ✅ Good use of Pydantic models for validation
- ✅ Clean router organization
- ✅ Environment-based configuration
- ✅ Proper async/await patterns

### Areas for Improvement
- ⚠️ Large service files (e.g., `openai_service.py` ~400 lines)
- ⚠️ Missing comprehensive testing structure
- ⚠️ Inconsistent error handling patterns
- ⚠️ Limited utility functions
- ⚠️ No background task management
- ⚠️ Missing API versioning strategy

## 2. Enhanced Folder Structure

### Recommended Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/                    # API versioning
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interview.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── sessions.py
│   │   │   │   └── websocket.py
│   │   │   ├── router.py
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py           # Unified database interface
│   │   ├── security.py           # Consolidated security
│   │   ├── cache.py              # Redis/cache management
│   │   ├── tasks.py              # Background tasks
│   │   └── exceptions.py         # Custom exceptions
│   ├── models/
│   │   ├── __init__.py
│   │   ├── domain/               # Domain models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── session.py
│   │   │   └── question.py
│   │   ├── schemas/              # API schemas
│   │   │   ├── __init__.py
│   │   │   ├── request.py
│   │   │   ├── response.py
│   │   │   └── common.py
│   │   └── enums.py              # All enums
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai/                   # AI-related services
│   │   │   ├── __init__.py
│   │   │   ├── openai_service.py
│   │   │   ├── prompt_builder.py
│   │   │   └── response_parser.py
│   │   ├── file/                 # File processing
│   │   │   ├── __init__.py
│   │   │   ├── file_service.py
│   │   │   └── text_processor.py
│   │   ├── pdf/                  # PDF generation
│   │   │   ├── __init__.py
│   │   │   └── pdf_service.py
│   │   ├── auth/                 # Authentication
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   └── jwt_service.py
│   │   └── session/              # Session management
│   │       ├── __init__.py
│   │       └── session_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── text.py               # Text processing utilities
│   │   ├── validation.py         # Validation helpers
│   │   ├── rate_limiting.py      # Rate limiting utilities
│   │   └── async_utils.py        # Async utilities
│   └── main.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_services/
│   │   ├── test_utils/
│   │   └── test_models/
│   ├── integration/
│   │   ├── test_api/
│   │   └── test_database/
│   └── e2e/
│       └── test_workflows/
├── scripts/
│   ├── __init__.py
│   ├── db_migration.py
│   ├── seed_data.py
│   └── cleanup.py
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── development.md
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── .env.example
├── .env.test
├── pytest.ini
├── mypy.ini
├── requirements-dev.txt
├── requirements-prod.txt
├── requirements.txt
├── README.md
└── Makefile
```

### Migration Strategy
1. **Phase 1**: Create new structure alongside existing
2. **Phase 2**: Move and refactor files incrementally
3. **Phase 3**: Update imports and remove old structure

## 3. Code Organization Principles

### Service Layer Refactoring
**Current Issue**: `openai_service.py` is 400+ lines with multiple responsibilities.

**Solution**: Break into focused modules:
```python
# services/ai/openai_service.py
class OpenAIService:
    def __init__(self, client: OpenAI):
        self.client = client

# services/ai/prompt_builder.py
class PromptBuilder:
    @staticmethod
    def build_question_generation_prompt(...) -> str:
        # Focused on prompt construction

# services/ai/response_parser.py
class ResponseParser:
    @staticmethod
    def parse_questions_response(content: str) -> List[Question]:
        # Focused on response parsing
```

### Dependency Injection Pattern
```python
# core/dependencies.py
from fastapi import Depends
from services.ai.openai_service import OpenAIService

def get_openai_service() -> OpenAIService:
    return OpenAIService()

# In endpoints
@router.post("/generate-questions")
async def generate_questions(
    request: QuestionGenerationRequest,
    ai_service: OpenAIService = Depends(get_openai_service)
):
    return await ai_service.generate_questions(request)
```

### Repository Pattern for Data Access
```python
# repositories/base.py
class BaseRepository:
    def __init__(self, db_client):
        self.db = db_client

# repositories/user_repository.py
class UserRepository(BaseRepository):
    async def get_user_by_email(self, email: str) -> Optional[User]:
        # Implementation

    async def create_user(self, user_data: dict) -> User:
        # Implementation
```

## 4. Service Layer Improvements

### Service Interface Pattern
```python
# services/interfaces/ai_service.py
from abc import ABC, abstractmethod
from typing import List
from models.domain.question import Question

class AIServiceInterface(ABC):
    @abstractmethod
    async def generate_questions(self, ...) -> List[Question]:
        pass

    @abstractmethod
    async def generate_answer(self, ...) -> str:
        pass

# services/ai/openai_service.py
class OpenAIService(AIServiceInterface):
    # Implementation
```

### Service Composition
```python
# services/composite/interview_service.py
class InterviewService:
    def __init__(
        self,
        ai_service: AIServiceInterface,
        file_service: FileServiceInterface,
        session_service: SessionServiceInterface
    ):
        self.ai = ai_service
        self.file = file_service
        self.session = session_service

    async def process_interview_request(self, request):
        # Orchestrate multiple services
        pass
```

## 5. Configuration Management

### Environment-Based Configuration
```python
# core/config.py
from pydantic_settings import BaseSettings
from typing import List

class DatabaseConfig(BaseModel):
    url: str
    pool_size: int = 10
    max_overflow: int = 20

class APIConfig(BaseModel):
    version: str = "v1"
    debug: bool = False
    cors_origins: List[str] = []

class Settings(BaseSettings):
    # Database
    database: DatabaseConfig

    # API
    api: APIConfig

    # External Services
    openai_api_key: str
    redis_url: Optional[str] = None

    class Config:
        env_nested_delimiter = "__"
        env_file = ".env"

# Usage: settings.database.url, settings.api.debug
```

### Configuration Validation
```python
# core/config_validation.py
def validate_config(settings: Settings) -> None:
    """Validate configuration on startup"""
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is required")

    # Validate database connectivity
    # Validate external service availability
```

## 6. Error Handling and Validation

### Custom Exceptions
```python
# core/exceptions.py
class InterviewBotError(Exception):
    """Base exception for application"""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class AIServiceError(InterviewBotError):
    pass

class ValidationError(InterviewBotError):
    def __init__(self, field: str, message: str):
        super().__init__(f"Validation error for {field}: {message}", "VALIDATION_ERROR")
        self.field = field

class RateLimitError(InterviewBotError):
    def __init__(self, retry_after: int):
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds", "RATE_LIMIT")
        self.retry_after = retry_after
```

### Global Exception Handler
```python
# main.py
from core.exceptions import InterviewBotError

@app.exception_handler(InterviewBotError)
async def handle_interview_bot_error(request: Request, exc: InterviewBotError):
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": getattr(exc, 'details', None)
        }
    )
```

### Request Validation Middleware
```python
# core/middleware/validation.py
class RequestValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            # Pre-request validation
            response = await call_next(request)
            return response
        except ValidationError as e:
            return JSONResponse(
                status_code=422,
                content={"error": "VALIDATION_ERROR", "field": e.field, "message": e.message}
            )
```

## 7. Testing Strategy

### Test Structure
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from core.database import get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    # Setup test database
    session = get_db()
    yield session
    # Cleanup

# tests/unit/test_services/test_openai_service.py
class TestOpenAIService:
    @pytest.mark.asyncio
    async def test_generate_questions_success(self, mock_openai_client):
        service = OpenAIService(mock_openai_client)
        questions = await service.generate_questions(...)
        assert len(questions) > 0

    @pytest.mark.asyncio
    async def test_generate_questions_api_error(self, mock_openai_client):
        mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
        service = OpenAIService(mock_openai_client)

        with pytest.raises(AIServiceError):
            await service.generate_questions(...)
```

### Mocking Strategy
```python
# tests/mocks/openai_mock.py
class MockOpenAIClient:
    def __init__(self):
        self.responses = {
            "generate_questions": {"choices": [{"message": {"content": '[{"question": "Test?"}]'}}]},
            "generate_answer": {"choices": [{"message": {"content": "Test answer"}}]}
        }

    def chat.completions.create(self, **kwargs):
        # Return appropriate mock response
        pass
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for services and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user workflows

## 8. Performance and Optimization

### Caching Strategy
```python
# core/cache.py
from redis import Redis
from typing import Optional
import json

class Cache:
    def __init__(self, redis_client: Optional[Redis] = None):
        self.redis = redis_client

    async def get(self, key: str) -> Optional[str]:
        if not self.redis:
            return None
        return await self.redis.get(key)

    async def set(self, key: str, value: str, ttl: int = 3600):
        if not self.redis:
            return
        await self.redis.setex(key, ttl, value)

# Usage in services
cache = Cache(redis_client)

@router.post("/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    cache_key = f"questions:{hash(str(request.dict()))}"

    cached = await cache.get(cache_key)
    if cached:
        return json.loads(cached)

    # Generate questions
    result = await ai_service.generate_questions(request)

    # Cache result
    await cache.set(cache_key, json.dumps(result.dict()), ttl=1800)

    return result
```

### Background Tasks
```python
# core/tasks.py
from fastapi import BackgroundTasks

class TaskManager:
    def __init__(self, background_tasks: BackgroundTasks):
        self.tasks = background_tasks

    def add_cleanup_task(self, user_id: str):
        self.tasks.add_task(self._cleanup_user_data, user_id)

    async def _cleanup_user_data(self, user_id: str):
        # Cleanup logic
        pass
```

### Connection Pooling
```python
# core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

class DatabaseManager:
    def __init__(self, mongo_url: str):
        self.mongo_url = mongo_url
        self._client: Optional[AsyncIOMotorClient] = None

    async def get_client(self) -> AsyncIOMotorClient:
        if not self._client:
            self._client = AsyncIOMotorClient(
                self.mongo_url,
                maxPoolSize=10,
                minPoolSize=5,
                maxIdleTimeMS=30000
            )
        return self._client

    async def close(self):
        if self._client:
            self._client.close()
```

## 9. Documentation and Code Quality

### API Documentation
```python
# docs/api.md
# InterviewBot API Documentation

## Authentication
All endpoints require Bearer token authentication...

## Rate Limiting
- Question generation: 10 requests/minute
- Answer generation: 20 requests/minute

## Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT`: Too many requests
- `AI_SERVICE_ERROR`: OpenAI API issues
```

### Code Quality Tools
```ini
# mypy.ini
[mypy]
python_version = 3.9
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True

# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=app --cov-report=html --cov-fail-under=80
```

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
```

## 10. Development Workflow

### Development Setup
```bash
# Makefile
.PHONY: install dev test lint format clean

install:
    pip install -r requirements-dev.txt

dev:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
    pytest tests/ -v --cov=app

lint:
    flake8 app/
    mypy app/

format:
    black app/
    isort app/

clean:
    find . -type f -name "*.pyc" -delete
    find . -type d -name "__pycache__" -delete
```

### Environment Management
```bash
# Use different environments
cp .env.example .env.local    # Development
cp .env.example .env.test     # Testing
cp .env.example .env.prod     # Production
```

### Deployment Strategy
```dockerfile
# docker/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Implementation Priority

### Phase 1: Foundation (High Priority)
1. Restructure folders (services/, models/, utils/)
2. Break down large service files
3. Add custom exceptions and error handling
4. Implement basic testing structure

### Phase 2: Quality (Medium Priority)
1. Add comprehensive test coverage
2. Implement caching and background tasks
3. Add code quality tools (mypy, black, flake8)
4. Improve configuration management

### Phase 3: Optimization (Low Priority)
1. Add performance monitoring
2. Implement advanced caching strategies
3. Add API versioning
4. Optimize database queries

## Best Practices Summary

- **Single Responsibility**: Each class/function should have one clear purpose
- **Dependency Injection**: Use DI for testability and flexibility
- **Error Handling**: Consistent error handling with custom exceptions
- **Testing**: Comprehensive test coverage with proper mocking
- **Documentation**: Clear docstrings and API documentation
- **Performance**: Implement caching and connection pooling
- **Security**: Input validation and rate limiting
- **Maintainability**: Clean code principles and consistent patterns

Start with Phase 1 to establish a solid foundation, then progressively improve code quality and add advanced features. Each refactoring should include corresponding tests to ensure functionality is preserved.