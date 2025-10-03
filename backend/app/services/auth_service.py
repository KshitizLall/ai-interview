from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId

from app.core.mongo import get_database
from app.core.config import settings
from app.models.schemas import UserCreate, UserInDB, UserProfileUpdate, CreditCheckRequest, CreditDeductRequest

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
            "credits": 50,  # Default credits for new users
            "sessions": [],
            "usage_stats": {},
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

    async def update_user_profile(self, user_id: str, profile_update: UserProfileUpdate) -> Optional[UserInDB]:
        """Update user profile information"""
        update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await self.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
            
        return await self.get_user_by_id(user_id)

    async def check_credits(self, user_id: str, required_credits: int = 1) -> dict:
        """Check if user has enough credits for an operation"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return {"has_credits": False, "current_credits": 0, "required_credits": required_credits}
        
        return {
            "has_credits": user.credits >= required_credits,
            "current_credits": user.credits,
            "required_credits": required_credits
        }

    async def deduct_credits(self, user_id: str, cost: int = 1) -> dict:
        """Deduct credits from user account"""
        user = await self.get_user_by_id(user_id)
        if not user or user.credits < cost:
            return {"success": False, "new_credit_balance": user.credits if user else 0}
        
        new_credits = max(0, user.credits - cost)
        result = await self.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {
                "$set": {"credits": new_credits, "updated_at": datetime.utcnow()},
                "$inc": {"usage_stats.total_operations": 1}
            }
        )
        
        return {
            "success": result.modified_count > 0,
            "new_credit_balance": new_credits
        }

    async def add_credits(self, user_id: str, amount: int) -> dict:
        """Add credits to user account (for admin or purchase operations)"""
        result = await self.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {
                "$inc": {"credits": amount},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        user = await self.get_user_by_id(user_id)
        return {
            "success": result.modified_count > 0,
            "new_credit_balance": user.credits if user else 0
        }

    async def add_session_to_user(self, user_id: str, session_id: str):
        """Add a session ID to user's session list"""
        await self.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {
                "$push": {"sessions": session_id},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

    async def remove_session_from_user(self, user_id: str, session_id: str):
        """Remove a session ID from user's session list"""
        await self.users.update_one(
            {"_id": ObjectId(user_id)}, 
            {
                "$pull": {"sessions": session_id},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )


auth_service = AuthService()
