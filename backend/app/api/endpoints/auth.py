from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import timedelta

from app.models.schemas import UserCreate, TokenResponse, LogoutResponse
from app.services.auth_service import auth_service, create_access_token
from app.core.config import settings

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
