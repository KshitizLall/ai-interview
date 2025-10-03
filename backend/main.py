from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.api.router import api_router
from app.core.config import settings
from app.core.mongo import get_client
from app.core.database_init import initialize_database, verify_database_connection

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 InterviewBot API starting up...")
    
    # Create upload directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("exports", exist_ok=True)
    # Initialize MongoDB client and database
    try:
        _ = get_client()
        print("✅ MongoDB client initialized")
        
        # Initialize database collections and indexes
        db_initialized = await initialize_database()
        if db_initialized:
            print("✅ Database initialization completed")
        else:
            print("⚠️ Database initialization failed, but continuing...")
            
    except Exception as e:
        print(f"⚠️ MongoDB initialization failed: {e}")
        print("⚠️ Continuing without database initialization...")
    yield
    
    # Shutdown
    print("🔄 InterviewBot API shutting down...")
    try:
        client = get_client()
        client.close()
        print("✅ MongoDB client closed")
    except Exception:
        pass

# Create FastAPI app
app = FastAPI(
    title="InterviewBot API",
    description="Backend API for AI-powered interview preparation application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF exports
app.mount("/exports", StaticFiles(directory="exports"), name="exports")

# Include API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": "InterviewBot API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    # Check database connection
    db_healthy = await verify_database_connection()
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "timestamp": "2025-10-04T00:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))  # Use PORT environment variable for Render
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Bind to all interfaces for production
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )