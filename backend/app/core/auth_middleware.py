from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.core.config import settings
from app.services.auth_service import auth_service
from app.models.schemas import UserInDB

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await auth_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    # Check if token is in user's active tokens (optional additional security)
    if credentials.credentials not in user.tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[UserInDB]:
    """Get the current authenticated user from JWT token, but allow None for anonymous users"""
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("user_id")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = await auth_service.get_user_by_id(user_id)
    if user is None:
        return None
    
    # Check if token is in user's active tokens
    if credentials.credentials not in user.tokens:
        return None
    
    return user


async def verify_credits(user: UserInDB, required_credits: int = 1) -> UserInDB:
    """Verify that user has enough credits for an operation"""
    if user.credits < required_credits:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {required_credits}, Available: {user.credits}"
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


auth_dep = AuthDependency()