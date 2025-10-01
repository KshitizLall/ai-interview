from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId

from app.core.mongo import get_database
from app.core.config import settings
from app.models.schemas import UserCreate, UserInDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_SECONDS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


class AuthService:
    def __init__(self):
        self.db = get_database()
        self.users = self.db.get_collection("users")

    async def create_user(self, user: UserCreate) -> UserInDB:
        existing = await self.users.find_one({"email": user.email})
        if existing:
            raise ValueError("User with this email already exists")

        user_doc = {
            "name": user.name,
            "email": user.email,
            "password_hash": hash_password(user.password),
            "tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await self.users.insert_one(user_doc)
        user_doc["id"] = str(result.inserted_id)
        return UserInDB(**user_doc)

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        user_doc = await self.users.find_one({"email": email})
        if not user_doc:
            return None
        if not verify_password(password, user_doc.get("password_hash")):
            return None
        user_doc["id"] = str(user_doc.get("_id"))
        return UserInDB(**user_doc)

    async def add_token(self, user_id: str, token: str):
        await self.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"tokens": token}})

    async def remove_token(self, user_id: str, token: str):
        await self.users.update_one({"_id": ObjectId(user_id)}, {"$pull": {"tokens": token}})

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        user_doc = await self.users.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            return None
        user_doc["id"] = str(user_doc.get("_id"))
        return UserInDB(**user_doc)


auth_service = AuthService()
