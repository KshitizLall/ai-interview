from fastapi import APIRouter

from app.api.endpoints import interview, websocket, auth, sessions

api_router = APIRouter()

api_router.include_router(
    interview.router,
    prefix="/interview",
    tags=["interview"]
)

api_router.include_router(
    websocket.router,
    prefix="/websocket",
    tags=["websocket"]
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"]
)

api_router.include_router(
    sessions.router,
    prefix="/sessions",
    tags=["sessions"]
)