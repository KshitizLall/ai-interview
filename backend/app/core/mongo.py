from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None


def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.MONGO_URI)
    return client


def get_database(name: str = "ai_interview"):
    return get_client()[name]
