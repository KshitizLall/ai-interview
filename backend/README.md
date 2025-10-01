# InterviewBot - FastAPI Backend

A robust FastAPI backend for the InterviewBot application that handles file processing, AI question/answer generation, and PDF exports.

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
│   ├── api/
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

Be sure to set a strong `JWT_SECRET_KEY` in your `.env` for token signing. You can also set `MONGO_URI` to override the default MongoDB connection string.

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
- `POST /interview/upload-file` - Upload and process resume files

### Question Generation
- `POST /interview/generate-questions` - Generate interview questions
- `POST /interview/generate-answer` - Generate sample answers

### PDF Export
- `POST /interview/export-pdf` - Export questions/answers to PDF

### Health Check
- `GET /interview/health` - Service health check
- `GET /health` - Application health check

## API Usage Examples

### Upload Resume File
```bash
curl -X POST "http://localhost:8000/interview/upload-file" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

### Generate Questions
```bash
curl -X POST "http://localhost:8000/interview/generate-questions" \
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
curl -X POST "http://localhost:8000/interview/generate-answer" \
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

1. Add new endpoint functions to `app/api/endpoints/interview.py`
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

## Auth smoke tests

After starting the server, you can test the new auth endpoints with curl:

Signup:

```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123","name":"Test User"}'
```

Login:

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

Logout (pass the Authorization header returned from login/signup):

```bash
curl -X POST "http://localhost:8000/auth/logout" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## API Curl Examples (use host http://localhost:10000)

Below are PowerShell-ready curl.exe commands for all endpoints. These assume the backend is running on http://localhost:10000.

Auth - Signup
```powershell
curl.exe -X POST "http://localhost:10000/auth/signup" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"secret123","name":"Test User"}'
```

Auth - Login
```powershell
curl.exe -X POST "http://localhost:10000/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"secret123"}'
```

Auth - Logout
```powershell
curl.exe -X POST "http://localhost:10000/auth/logout" `
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Upload resume file (replace path to your file)
```powershell
curl.exe -X POST "http://localhost:10000/interview/upload-file" `
  -H "Accept: application/json" `
  -F "file=@C:\path\to\resume.pdf"
```

Generate questions (combined mode)
```powershell
curl.exe -X POST "http://localhost:10000/interview/generate-questions" `
  -H "Content-Type: application/json" `
  -d '{
    "resume_text": "Experienced backend engineer...",
    "job_description": "Looking for a Python backend developer...",
    "mode": "combined",
    "question_count": 5,
    "include_answers": false
  }'
```

Generate one answer for a question
```powershell
curl.exe -X POST "http://localhost:10000/interview/generate-answer" `
  -H "Content-Type: application/json" `
  -d '{
    "question": "Tell me about a time you led a project.",
    "resume_text": "Led a team of 4 engineers to deliver a SaaS feature..."
  }'
```

Generate bulk answers
```powershell
curl.exe -X POST "http://localhost:10000/interview/generate-bulk-answers" `
  -H "Content-Type: application/json" `
  -d '{
    "questions": [
      { "id": "q1", "question": "How do you design scalable systems?", "type": "technical", "difficulty": "advanced", "relevance_score": 0.9 },
      { "id": "q2", "question": "Tell me about a time you resolved conflict.", "type": "behavioral", "difficulty": "intermediate", "relevance_score": 0.8 }
    ],
    "resume_text": "My background includes ...",
    "answer_style": "professional"
  }'
```

Export to PDF
```powershell
curl.exe -X POST "http://localhost:10000/interview/export-pdf" `
  -H "Content-Type: application/json" `
  -d '{
    "questions": [
      { "id": "q1", "question": "What is your greatest strength?", "type": "general", "difficulty":"beginner", "relevance_score": 0.5 }
    ],
    "answers": { "q1": "My greatest strength is..." },
    "resume_filename": "resume.pdf",
    "job_title": "Backend Engineer"
  }'
```

Health endpoints
```powershell
curl.exe "http://localhost:10000/health"
curl.exe "http://localhost:10000/interview/health"
```

WebSocket
- Use a WebSocket client like `wscat` or the browser (curl does not support WebSocket). Connect to: `ws://0.0.0.0:10000/websocket/ws?session_id=test-session`

Notes:
- Replace `<ACCESS_TOKEN>` with the JWT returned by `/auth/login` or `/auth/signup`.
- For PowerShell prefer `curl.exe` to avoid the shell alias for `curl`.
- You can import any `curl` block into Postman by copying the raw curl command (Postman > Import > Raw text).

