from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import timedelta

from app.models.schemas import (
    UserCreate, TokenResponse, LogoutResponse, UserPublic, UserProfileUpdate,
    CreditCheckRequest, CreditCheckResponse, CreditDeductRequest, CreditDeductResponse
)
from app.services.auth_service import auth_service, create_access_token
from app.core.config import settings
from app.core.auth_middleware import auth_dep

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserCreate):
    """Register a new user and return JWT token"""
    try:
        new_user = await auth_service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token({"sub": new_user.email, "user_id": new_user.id}, expires_delta=timedelta(seconds=settings.JWT_EXPIRATION_SECONDS))
    await auth_service.add_token(new_user.id, access_token)
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserCreate):
    """Authenticate user and return JWT token"""
    user = await auth_service.authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user.email, "user_id": user.id}, expires_delta=timedelta(seconds=settings.JWT_EXPIRATION_SECONDS))
    await auth_service.add_token(user.id, access_token)
    return TokenResponse(access_token=access_token)


@router.post("/logout", response_model=LogoutResponse)
async def logout(authorization: str = Header(None)):
    """Logout by removing token from user's token list (if present). Pass Authorization header: Bearer <token>"""
    if not authorization:
        raise HTTPException(status_code=400, detail="Missing Authorization header")

    try:
        scheme, token = authorization.split()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")

    # Decode to get user_id
    try:
        payload = __import__("jose").jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id:
            await auth_service.remove_token(user_id, token)
    except Exception:
        # If token invalid, just return success so client can clear it
        pass

    return LogoutResponse(detail="Logged out")


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
