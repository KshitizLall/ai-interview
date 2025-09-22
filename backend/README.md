# AI Interview Prep - FastAPI Backend

A robust FastAPI backend for the AI Interview Preparation application that handles file processing, AI question/answer generation, and PDF exports.

## Features

- **File Upload & Processing**: Support for PDF, DOCX, and TXT resume files
- **AI Question Generation**: Generate relevant interview questions using OpenAI
- **AI Answer Generation**: Create sample answers for interview questions
- **PDF Export**: Export questions and answers to professionally formatted PDFs
- **RESTful API**: Clean, documented API endpoints
- **Error Handling**: Comprehensive error handling and validation

## Project Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   └── interview.py      # Interview-related endpoints
│   │   └── router.py             # API router configuration
│   ├── core/
│   │   └── config.py             # Application configuration
│   ├── models/
│   │   └── schemas.py            # Pydantic models
│   └── services/
│       ├── file_service.py       # File processing service
│       ├── openai_service.py     # OpenAI integration service
│       └── pdf_service.py        # PDF generation service
├── uploads/                      # File upload directory
├── exports/                      # PDF export directory
├── main.py                       # FastAPI application entry point
├── requirements.txt              # Python dependencies
└── .env.example                  # Environment variables template
```

## Setup Instructions

### 1. Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your OpenAI API key
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 4. Run the Application

```bash
# Development server with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### File Processing
- `POST /api/v1/interview/upload-file` - Upload and process resume files

### Question Generation
- `POST /api/v1/interview/generate-questions` - Generate interview questions
- `POST /api/v1/interview/generate-answer` - Generate sample answers

### PDF Export
- `POST /api/v1/interview/export-pdf` - Export questions/answers to PDF

### Health Check
- `GET /api/v1/interview/health` - Service health check
- `GET /health` - Application health check

## API Usage Examples

### Upload Resume File
```bash
curl -X POST "http://localhost:8000/api/v1/interview/upload-file" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

### Generate Questions
```bash
curl -X POST "http://localhost:8000/api/v1/interview/generate-questions" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "John Doe, Software Engineer...",
    "job_description": "We are looking for a Python developer...",
    "mode": "combined",
    "question_count": 10,
    "include_answers": false
  }'
```

### Generate Answer
```bash
curl -X POST "http://localhost:8000/api/v1/interview/generate-answer" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about your Python experience",
    "resume_text": "John Doe, Software Engineer...",
    "job_description": "We are looking for a Python developer..."
  }'
```

## Configuration

Key configuration options in `.env`:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o-mini)
- `MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 10MB)
- `ALLOWED_HOSTS`: CORS allowed origins
- `DEBUG`: Enable debug mode

## Development

### Adding New Endpoints

1. Add new endpoint functions to `app/api/v1/endpoints/interview.py`
2. Add corresponding Pydantic models to `app/models/schemas.py`
3. Create service logic in appropriate service files
4. Update router if needed

### Adding New Services

1. Create new service file in `app/services/`
2. Implement service class with required methods
3. Import and use in endpoint handlers
4. Add any new dependencies to `requirements.txt`

## Production Deployment

For production deployment, consider:

1. Use environment variables for all sensitive configuration
2. Set up proper logging and monitoring
3. Use a production WSGI server (e.g., Gunicorn)
4. Implement rate limiting and authentication
5. Set up file storage (AWS S3, etc.) for larger scale
6. Use a proper database instead of in-memory storage

## Dependencies

- **FastAPI**: Modern, fast web framework
- **OpenAI**: AI question/answer generation
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX text extraction
- **ReportLab**: PDF generation
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation and settings management