from typing import Dict, Any
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import logging
from collections import defaultdict
import asyncio

from app.core.config import settings

# Initialize limiter with Redis-like storage (in-memory for now)
limiter = Limiter(key_func=get_remote_address)

# In-memory storage for tracking failed attempts (use Redis in production)
failed_attempts: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"count": 0, "last_attempt": None, "locked_until": None})

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """Enhanced security middleware for authentication protection"""
    
    @staticmethod
    def is_locked_out(identifier: str) -> bool:
        """Check if an identifier (IP/email) is currently locked out"""
        attempt_data = failed_attempts[identifier]
        
        if attempt_data["locked_until"] and datetime.utcnow() < attempt_data["locked_until"]:
            return True
        elif attempt_data["locked_until"] and datetime.utcnow() >= attempt_data["locked_until"]:
            # Lock expired, reset counter
            failed_attempts[identifier] = {"count": 0, "last_attempt": None, "locked_until": None}
            
        return False
    
    @staticmethod
    def record_failed_attempt(identifier: str) -> None:
        """Record a failed authentication attempt"""
        attempt_data = failed_attempts[identifier]
        attempt_data["count"] += 1
        attempt_data["last_attempt"] = datetime.utcnow()
        
        # Lock after max attempts
        if attempt_data["count"] >= settings.MAX_LOGIN_ATTEMPTS:
            attempt_data["locked_until"] = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            logger.warning(f"Identifier {identifier} locked out due to {attempt_data['count']} failed attempts")
    
    @staticmethod
    def record_successful_attempt(identifier: str) -> None:
        """Record a successful authentication (reset counter)"""
        if identifier in failed_attempts:
            del failed_attempts[identifier]
    
    @staticmethod
    def check_rate_limit_and_lockout(identifier: str) -> None:
        """Check both rate limiting and account lockout"""
        if SecurityMiddleware.is_locked_out(identifier):
            attempt_data = failed_attempts[identifier]
            remaining_time = attempt_data["locked_until"] - datetime.utcnow()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account temporarily locked. Try again in {int(remaining_time.total_seconds() / 60)} minutes."
            )


async def cleanup_expired_attempts():
    """Periodic cleanup of expired attempt records"""
    while True:
        try:
            current_time = datetime.utcnow()
            expired_keys = []
            
            for identifier, data in failed_attempts.items():
                # Clean up records older than 24 hours
                if (data["last_attempt"] and 
                    current_time - data["last_attempt"] > timedelta(hours=24)):
                    expired_keys.append(identifier)
            
            for key in expired_keys:
                del failed_attempts[key]
                
            logger.info(f"Cleaned up {len(expired_keys)} expired attempt records")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
        
        # Run cleanup every hour
        await asyncio.sleep(3600)


# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded"""
    response = _rate_limit_exceeded_handler(request, exc)
    logger.warning(f"Rate limit exceeded for {get_remote_address(request)}: {exc.detail}")
    return response


# Rate limiting decorators for different endpoints
def auth_rate_limit():
    """Rate limiting for authentication endpoints"""
    return limiter.limit(settings.RATE_LIMIT_LOGIN)


def signup_rate_limit():
    """Rate limiting for signup endpoints"""
    return limiter.limit(settings.RATE_LIMIT_SIGNUP)


def general_rate_limit():
    """Rate limiting for general API endpoints"""
    return limiter.limit(settings.RATE_LIMIT_GENERAL)


# Helper function to get client identifier
def get_client_identifier(request: Request, email: str = None) -> str:
    """Get client identifier for rate limiting (prefer email, fallback to IP)"""
    if email:
        return f"email:{email}"
    return f"ip:{get_remote_address(request)}"


# Security headers middleware
class SecurityHeadersMiddleware:
    """Add security headers to responses"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = dict(message.get("headers", []))
                
                # Add security headers
                security_headers = {
                    b"x-content-type-options": b"nosniff",
                    b"x-frame-options": b"DENY", 
                    b"x-xss-protection": b"1; mode=block",
                    b"strict-transport-security": b"max-age=31536000; includeSubDomains",
                    b"referrer-policy": b"strict-origin-when-cross-origin",
                    b"permissions-policy": b"geolocation=(), microphone=(), camera=()",
                }
                
                headers.update(security_headers)
                message["headers"] = list(headers.items())
            
            await send(message)
        
        await self.app(scope, receive, send_wrapper)