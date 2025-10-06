from typing import Optional
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.core.config import settings
from app.services.auth_service import auth_service, verify_token, AuthError, TokenType
from app.models.schemas import UserInDB

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)  # Don't auto-error for optional auth


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """Get the current authenticated user from JWT token with enhanced security"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Verify token format and signature
        payload = verify_token(token, TokenType.ACCESS)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if token is blacklisted
        if await auth_service.is_token_blacklisted(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Log successful authentication for security monitoring
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"User {user.email} authenticated from {client_ip}")
        
        return user
        
    except AuthError as e:
        error_details = {
            "TOKEN_EXPIRED": "Token has expired, please login again",
            "INVALID_TOKEN": "Invalid or malformed token",
        }
        
        detail = error_details.get(e.code, "Authentication failed")
        
        # Log authentication failure
        client_ip = request.client.host if request.client else "unknown"
        logger.warning(f"Authentication failed from {client_ip}: {e.message}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserInDB]:
    """Get the current authenticated user from JWT token, but allow None for anonymous users"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        # For optional auth, return None instead of raising error
        return None
    except Exception as e:
        logger.warning(f"Optional auth failed: {e}")
        return None


async def verify_credits(user: UserInDB, required_credits: int = 1) -> UserInDB:
    """Verify that user has enough credits for an operation"""
    if user.credits < required_credits:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {required_credits}, Available: {user.credits}",
            headers={"X-Credits-Required": str(required_credits), "X-Credits-Available": str(user.credits)}
        )
    return user


async def verify_admin_role(user: UserInDB) -> UserInDB:
    """Verify that user has admin privileges"""
    # For now, check if user has a specific admin field or email pattern
    # In production, implement proper role-based access control
    admin_emails = ["admin@interviewbot.com"]  # Configure in settings
    
    if user.email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user


class AuthDependency:
    """Dependency class for different authentication requirements"""
    
    @staticmethod
    def required():
        """Authentication is required"""
        return Depends(get_current_user)
    
    @staticmethod
    def optional():
        """Authentication is optional"""
        return Depends(get_current_user_optional)
    
    @staticmethod
    def with_credits(required_credits: int = 1):
        """Authentication required with credit verification"""
        async def _verify_user_credits(user: UserInDB = Depends(get_current_user)) -> UserInDB:
            return await verify_credits(user, required_credits)
        return Depends(_verify_user_credits)
    
    @staticmethod
    def admin_required():
        """Admin authentication required"""
        async def _verify_admin(user: UserInDB = Depends(get_current_user)) -> UserInDB:
            return await verify_admin_role(user)
        return Depends(_verify_admin)


# Create auth dependency instance
auth_dep = AuthDependency()


# Middleware for token cleanup (optional)
class TokenCleanupMiddleware:
    """Middleware to clean up expired tokens periodically"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        # Add token cleanup logic here if needed
        # This could run periodically to clean up expired blacklisted tokens
        await self.app(scope, receive, send)