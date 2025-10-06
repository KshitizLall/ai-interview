from fastapi import APIRouter, HTTPException, Depends, Header, Request, status
from datetime import timedelta
import logging

from app.models.schemas import (
    UserCreate, TokenResponse, LogoutResponse, UserPublic, UserProfileUpdate,
    CreditCheckRequest, CreditCheckResponse, CreditDeductRequest, CreditDeductResponse
)
from app.services.auth_service import auth_service, AuthError
from app.core.config import settings
from app.core.auth_middleware import auth_dep
from app.core.security_middleware import (
    auth_rate_limit, signup_rate_limit, SecurityMiddleware, get_client_identifier
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/signup")
@signup_rate_limit()
async def signup(request: Request, user: UserCreate):
    """Register a new user and return JWT tokens with enhanced security"""
    client_identifier = get_client_identifier(request, user.email)
    
    try:
        # Check rate limiting and lockout
        SecurityMiddleware.check_rate_limit_and_lockout(client_identifier)
        
        # Create user with enhanced validation
        new_user, access_token, refresh_token = await auth_service.create_user(user)
        
        # Record successful attempt
        SecurityMiddleware.record_successful_attempt(client_identifier)
        
        logger.info(f"New user registered: {user.email}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "credits": new_user.credits
            }
        }
        
    except AuthError as e:
        # Record failed attempt
        SecurityMiddleware.record_failed_attempt(client_identifier)
        
        error_codes = {
            "INVALID_EMAIL": status.HTTP_400_BAD_REQUEST,
            "WEAK_PASSWORD": status.HTTP_400_BAD_REQUEST,
            "EMAIL_EXISTS": status.HTTP_409_CONFLICT
        }
        
        status_code = error_codes.get(e.code, status.HTTP_400_BAD_REQUEST)
        logger.warning(f"Signup failed for {user.email}: {e.message}")
        
        raise HTTPException(status_code=status_code, detail=e.message)
    except Exception as e:
        SecurityMiddleware.record_failed_attempt(client_identifier)
        logger.error(f"Signup error for {user.email}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@router.post("/login")
@auth_rate_limit()
async def login(request: Request, credentials: UserCreate):
    """Authenticate user and return JWT tokens with enhanced security"""
    client_identifier = get_client_identifier(request, credentials.email)
    
    try:
        # Check rate limiting and lockout
        SecurityMiddleware.check_rate_limit_and_lockout(client_identifier)
        
        # Authenticate user
        user, access_token, refresh_token = await auth_service.authenticate_user(
            credentials.email, credentials.password
        )
        
        # Record successful attempt
        SecurityMiddleware.record_successful_attempt(client_identifier)
        
        logger.info(f"User logged in: {credentials.email}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "credits": user.credits
            }
        }
        
    except AuthError as e:
        # Record failed attempt
        SecurityMiddleware.record_failed_attempt(client_identifier)
        
        error_codes = {
            "INVALID_CREDENTIALS": status.HTTP_401_UNAUTHORIZED,
            "ACCOUNT_LOCKED": status.HTTP_423_LOCKED,
            "ACCOUNT_DEACTIVATED": status.HTTP_403_FORBIDDEN
        }
        
        status_code = error_codes.get(e.code, status.HTTP_401_UNAUTHORIZED)
        
        # Don't expose specific error details for security
        if e.code == "ACCOUNT_LOCKED":
            detail = e.message
        else:
            detail = "Invalid email or password"
            
        logger.warning(f"Login failed for {credentials.email}: {e.message}")
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        SecurityMiddleware.record_failed_attempt(client_identifier)
        logger.error(f"Login error for {credentials.email}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed")


@router.post("/refresh")
async def refresh_token(refresh_token: str = Header(..., alias="X-Refresh-Token")):
    """Refresh access token using refresh token"""
    try:
        new_access_token, new_refresh_token = await auth_service.refresh_access_token(refresh_token)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except AuthError as e:
        logger.warning(f"Token refresh failed: {e.message}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token refresh failed")


@router.post("/logout")
async def logout(
    current_user = auth_dep.required(),
    refresh_token: str = Header(None, alias="X-Refresh-Token")
):
    """Logout user and revoke tokens"""
    try:
        # Revoke refresh tokens
        if refresh_token:
            await auth_service.revoke_refresh_token(current_user.id, refresh_token)
        else:
            # Revoke all refresh tokens if no specific token provided
            await auth_service.revoke_refresh_token(current_user.id)
        
        logger.info(f"User logged out: {current_user.email}")
        return {"detail": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error for {current_user.email}: {e}")
        # Return success even if token revocation fails
        return {"detail": "Logged out"}


@router.get("/profile", response_model=UserPublic)
async def get_profile(current_user = auth_dep.required()):
    """Get current user's profile information"""
    return UserPublic(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        credits=current_user.credits,
        sessions=current_user.sessions,
        created_at=current_user.created_at
    )


@router.put("/profile", response_model=UserPublic)
async def update_profile(profile_update: UserProfileUpdate, current_user = auth_dep.required()):
    """Update current user's profile information"""
    updated_user = await auth_service.update_user_profile(current_user.id, profile_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserPublic(
        id=updated_user.id,
        name=updated_user.name,
        email=updated_user.email,
        credits=updated_user.credits,
        sessions=updated_user.sessions,
        created_at=updated_user.created_at
    )


@router.post("/credits/check", response_model=CreditCheckResponse)
async def check_credits(request: CreditCheckRequest, current_user = auth_dep.required()):
    """Check if user has enough credits for an operation"""
    credit_check = await auth_service.check_credits(current_user.id, request.cost)
    return CreditCheckResponse(
        has_credits=credit_check["has_credits"],
        current_credits=credit_check["current_credits"],
        required_credits=credit_check["required_credits"]
    )


@router.post("/credits/deduct", response_model=CreditDeductResponse)
async def deduct_credits(request: CreditDeductRequest, current_user = auth_dep.required()):
    """Deduct credits from user account for an operation"""
    result = await auth_service.deduct_credits(current_user.id, request.cost)
    return CreditDeductResponse(
        success=result["success"],
        new_credit_balance=result["new_credit_balance"]
    )


@router.post("/credits/add")
async def add_credits(amount: int, current_user = auth_dep.required()):
    """Add credits to user account (admin or purchase operation)"""
    # Note: In production, this should be protected by admin role or payment verification
    result = await auth_service.add_credits(current_user.id, amount)
    return {
        "success": result["success"],
        "new_credit_balance": result["new_credit_balance"],
        "message": f"Added {amount} credits to account"
    }
