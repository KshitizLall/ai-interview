from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.api.v1.router import api_router
from app.core.config import settings

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 AI Interview Prep API starting up...")
    
    # Create upload directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("exports", exist_ok=True)
    
    yield
    
    # Shutdown
    print("🔄 AI Interview Prep API shutting down...")

# Create FastAPI app
app = FastAPI(
    title="AI Interview Prep API",
    description="Backend API for AI-powered interview preparation application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF exports
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "AI Interview Prep API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )