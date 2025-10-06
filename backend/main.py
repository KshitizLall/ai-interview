from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging
import asyncio
from dotenv import load_dotenv

from app.api.router import api_router
from app.core.config import settings
from app.core.mongo import get_client
from app.core.database_init import initialize_database, verify_database_connection
from app.core.security_middleware import (
    limiter, SecurityHeadersMiddleware, cleanup_expired_attempts, rate_limit_handler
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 InterviewBot API starting up...")
    
    # Create upload directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("exports", exist_ok=True)
    
    # Initialize MongoDB client and database
    try:
        _ = get_client()
        logger.info("✅ MongoDB client initialized")
        
        # Initialize database collections and indexes
        db_initialized = await initialize_database()
        if db_initialized:
            logger.info("✅ Database initialization completed")
        else:
            logger.warning("⚠️ Database initialization failed, but continuing...")
            
    except Exception as e:
        logger.warning(f"⚠️ MongoDB initialization failed: {e}")
        logger.warning("⚠️ Continuing without database initialization...")
    
    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_expired_attempts())
    logger.info("✅ Security cleanup task started")
    
    yield
    
    # Shutdown
    logger.info("🔄 InterviewBot API shutting down...")
    
    # Cancel cleanup task
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    
    try:
        client = get_client()
        client.close()
        logger.info("✅ MongoDB client closed")
    except Exception:
        pass

# Create FastAPI app
app = FastAPI(
    title="InterviewBot API",
    description="Backend API for AI-powered interview preparation application with enhanced security",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if settings.DEBUG else None,  # Disable redoc in production
)

# Add security headers middleware (should be first)
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS with enhanced settings
allowed_origins = settings.ALLOWED_HOSTS
if settings.ENVIRONMENT == "development":
    allowed_origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Be specific about methods
    allow_headers=[
        "Authorization",
        "Content-Type", 
        "X-Refresh-Token",
        "X-Requested-With",
        "Accept",
        "Origin",
        "User-Agent",
    ],
    expose_headers=["X-Credits-Required", "X-Credits-Available"],
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
    """Enhanced health check with security considerations"""
    try:
        # Check database connection
        db_healthy = await verify_database_connection()
        
        # Basic health info (don't expose sensitive details)
        health_data = {
            "status": "healthy" if db_healthy else "degraded",
            "database": "connected" if db_healthy else "disconnected",
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT if settings.DEBUG else "production"
        }
        
        # Add more details in debug mode only
        if settings.DEBUG:
            import datetime
            health_data["timestamp"] = datetime.datetime.utcnow().isoformat()
            health_data["debug_mode"] = True
        
        return health_data
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": "Service unavailable"
            }
        )


# Global exception handler for security
@app.exception_handler(500)
async def internal_server_error(request: Request, exc: Exception):
    """Handle internal server errors without exposing details"""
    logger.error(f"Internal server error: {exc}")
    
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(exc)}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

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