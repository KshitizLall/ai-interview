from fastapi import APIRouter

from app.api.endpoints import interview, websocket

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