from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
import jwt
from bson import ObjectId
import logging
import uuid
from enum import Enum

from app.core.mongo import get_database
from app.core.config import settings
from app.core.security_utils import PasswordValidator, EmailValidator, InputSanitizer
from app.models.schemas import UserCreate, UserInDB, UserProfileUpdate, CreditCheckRequest, CreditDeductRequest

logger = logging.getLogger(__name__)


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


class AuthError(Exception):
    """Custom authentication error"""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(self.message)


def create_token(data: dict, token_type: TokenType, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT tokens with enhanced security"""
    to_encode = data.copy()
    
    # Set expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if token_type == TokenType.ACCESS:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        else:  # REFRESH
            expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
        "token_type": token_type.value,
        "jti": str(uuid.uuid4())  # Unique token ID for revocation
    })
    
    try:
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation failed: {e}")
        raise AuthError("Failed to create authentication token")


def verify_token(token: str, token_type: TokenType = None) -> Dict:
    """Verify JWT token with enhanced validation"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER
        )
        
        # Verify token type if specified
        if token_type and payload.get("token_type") != token_type.value:
            raise AuthError(f"Invalid token type. Expected {token_type.value}")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired", "TOKEN_EXPIRED")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise AuthError("Invalid token", "INVALID_TOKEN")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise AuthError("Token verification failed")


class AuthService:
    def __init__(self):
        self.db = get_database()
        self.users = self.db.get_collection("users")
        self.blacklisted_tokens = self.db.get_collection("blacklisted_tokens")
        
        # Create indexes for performance
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Email index (unique)
            self.users.create_index("email", unique=True)
            # Token blacklist index with TTL
            self.blacklisted_tokens.create_index("expires_at", expireAfterSeconds=0)
            # User update time index
            self.users.create_index("updated_at")
        except Exception as e:
            logger.warning(f"Index creation failed: {e}")

    async def create_user(self, user: UserCreate) -> Tuple[UserInDB, str, str]:
        """Create new user with enhanced validation and return user + tokens"""
        # Sanitize and validate email
        email_valid, email_message = EmailValidator.validate_email_format(user.email)
        if not email_valid:
            raise AuthError(email_message, "INVALID_EMAIL")
        
        normalized_email = user.email.lower().strip()
        
        # Validate password strength
        password_valid, password_message, password_details = PasswordValidator.validate_password_strength(user.password)
        if not password_valid:
            raise AuthError(password_message, "WEAK_PASSWORD")
        
        # Sanitize name
        sanitized_name = InputSanitizer.sanitize_name(user.name) if user.name else None
        
        # Check for existing user
        try:
            existing = await self.users.find_one({"email": normalized_email})
            if existing:
                raise AuthError("An account with this email already exists", "EMAIL_EXISTS")
        except Exception as e:
            if isinstance(e, AuthError):
                raise
            logger.error(f"Database error checking existing user: {e}")
            raise AuthError("Failed to validate email availability")

        # Create user document
        user_doc = {
            "name": sanitized_name,
            "email": normalized_email,
            "password_hash": PasswordValidator.hash_password(user.password),
            "password_history": [],  # Track password history for reuse prevention
            "active_refresh_tokens": [],  # Track active refresh tokens
            "credits": 50,  # Default credits for new users
            "sessions": [],
            "usage_stats": {
                "total_operations": 0,
                "last_login": None,
                "login_count": 0
            },
            "security_settings": {
                "last_password_change": datetime.utcnow(),
                "failed_login_attempts": 0,
                "locked_until": None,
                "password_strength_score": password_details.get("strength_score", 0)
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "email_verified": False  # For future email verification
        }

        try:
            result = await self.users.insert_one(user_doc)
            user_doc["id"] = str(result.inserted_id)
            
            # Create tokens
            user_data = {"user_id": user_doc["id"], "email": normalized_email}
            access_token = create_token(user_data, TokenType.ACCESS)
            refresh_token = create_token(user_data, TokenType.REFRESH)
            
            # Store refresh token
            await self._store_refresh_token(user_doc["id"], refresh_token)
            
            # Update login stats
            await self._update_login_stats(user_doc["id"])
            
            logger.info(f"New user created: {normalized_email}")
            return UserInDB(**user_doc), access_token, refresh_token
            
        except Exception as e:
            logger.error(f"Failed to create user {normalized_email}: {e}")
            raise AuthError("Failed to create user account")

    async def authenticate_user(self, email: str, password: str) -> Tuple[UserInDB, str, str]:
        """Authenticate user with enhanced security"""
        if not email or not password:
            raise AuthError("Email and password are required", "MISSING_CREDENTIALS")
        
        normalized_email = email.lower().strip()
        
        try:
            user_doc = await self.users.find_one({"email": normalized_email})
            if not user_doc:
                raise AuthError("Invalid email or password", "INVALID_CREDENTIALS")
            
            # Check if user is active
            if not user_doc.get("is_active", True):
                raise AuthError("Account is deactivated", "ACCOUNT_DEACTIVATED")
            
            # Check if account is locked
            security_settings = user_doc.get("security_settings", {})
            locked_until = security_settings.get("locked_until")
            if locked_until and datetime.utcnow() < locked_until:
                raise AuthError("Account is temporarily locked due to too many failed attempts", "ACCOUNT_LOCKED")
            
            # Verify password
            password_hash = user_doc.get("password_hash")
            if not password_hash or not PasswordValidator.verify_password(password, password_hash):
                # Record failed attempt
                await self._record_failed_login(user_doc["_id"])
                raise AuthError("Invalid email or password", "INVALID_CREDENTIALS")
            
            # Clear failed attempts on successful login
            await self._clear_failed_attempts(user_doc["_id"])
            
            # Update login stats
            await self._update_login_stats(str(user_doc["_id"]))
            
            # Create tokens
            user_doc["id"] = str(user_doc["_id"])
            user_data = {"user_id": user_doc["id"], "email": normalized_email}
            access_token = create_token(user_data, TokenType.ACCESS)
            refresh_token = create_token(user_data, TokenType.REFRESH)
            
            # Store refresh token
            await self._store_refresh_token(user_doc["id"], refresh_token)
            
            logger.info(f"User authenticated: {normalized_email}")
            return UserInDB(**user_doc), access_token, refresh_token
            
        except AuthError:
            raise
        except Exception as e:
            logger.error(f"Authentication error for {normalized_email}: {e}")
            raise AuthError("Authentication failed")

    async def refresh_access_token(self, refresh_token: str) -> Tuple[str, str]:
        """Refresh access token using refresh token"""
        try:
            payload = verify_token(refresh_token, TokenType.REFRESH)
            user_id = payload.get("user_id")
            email = payload.get("email")
            
            if not user_id or not email:
                raise AuthError("Invalid refresh token")
            
            # Check if refresh token is still valid in database
            user_doc = await self.users.find_one({"_id": ObjectId(user_id)})
            if not user_doc or not user_doc.get("is_active", True):
                raise AuthError("User not found or inactive")
            
            active_tokens = user_doc.get("active_refresh_tokens", [])
            token_jti = payload.get("jti")
            
            if token_jti not in active_tokens:
                raise AuthError("Refresh token has been revoked")
            
            # Create new tokens
            user_data = {"user_id": user_id, "email": email}
            new_access_token = create_token(user_data, TokenType.ACCESS)
            new_refresh_token = create_token(user_data, TokenType.REFRESH)
            
            # Replace old refresh token with new one
            await self._replace_refresh_token(user_id, token_jti, new_refresh_token)
            
            return new_access_token, new_refresh_token
            
        except AuthError:
            raise
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            raise AuthError("Token refresh failed")

    async def revoke_refresh_token(self, user_id: str, refresh_token: str = None):
        """Revoke specific refresh token or all tokens for user"""
        try:
            if refresh_token:
                payload = verify_token(refresh_token, TokenType.REFRESH)
                token_jti = payload.get("jti")
                await self.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$pull": {"active_refresh_tokens": token_jti}}
                )
            else:
                # Revoke all refresh tokens
                await self.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"active_refresh_tokens": []}}
                )
        except Exception as e:
            logger.error(f"Token revocation failed: {e}")

    async def blacklist_token(self, token: str):
        """Add token to blacklist"""
        try:
            payload = verify_token(token)
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                expires_at = datetime.fromtimestamp(exp_timestamp)
                await self.blacklisted_tokens.insert_one({
                    "jti": payload.get("jti"),
                    "expires_at": expires_at
                })
        except Exception as e:
            logger.error(f"Token blacklisting failed: {e}")

    async def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        try:
            payload = verify_token(token)
            jti = payload.get("jti")
            if jti:
                result = await self.blacklisted_tokens.find_one({"jti": jti})
                return result is not None
        except:
            pass
        return False

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID with error handling"""
        try:
            user_doc = await self.users.find_one({"_id": ObjectId(user_id)})
            if not user_doc or not user_doc.get("is_active", True):
                return None
            user_doc["id"] = str(user_doc["_id"])
            return UserInDB(**user_doc)
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {e}")
            return None

    async def update_user_profile(self, user_id: str, profile_update: UserProfileUpdate) -> Optional[UserInDB]:
        """Update user profile with validation"""
        update_data = {}
        
        if profile_update.name is not None:
            update_data["name"] = InputSanitizer.sanitize_name(profile_update.name)
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.users.update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return await self.get_user_by_id(user_id)
        
        return None

    # Credit and session management methods (simplified for brevity)
    async def check_credits(self, user_id: str, required_credits: int = 1) -> dict:
        user = await self.get_user_by_id(user_id)
        if not user:
            return {"has_credits": False, "current_credits": 0, "required_credits": required_credits}
        
        return {
            "has_credits": user.credits >= required_credits,
            "current_credits": user.credits,
            "required_credits": required_credits
        }

    async def deduct_credits(self, user_id: str, cost: int = 1) -> dict:
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

    # Helper methods
    async def _store_refresh_token(self, user_id: str, refresh_token: str):
        """Store refresh token JTI"""
        try:
            payload = verify_token(refresh_token, TokenType.REFRESH)
            token_jti = payload.get("jti")
            if token_jti:
                await self.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$push": {"active_refresh_tokens": token_jti}}
                )
        except Exception as e:
            logger.error(f"Failed to store refresh token: {e}")

    async def _replace_refresh_token(self, user_id: str, old_jti: str, new_refresh_token: str):
        """Replace old refresh token with new one"""
        try:
            new_payload = verify_token(new_refresh_token, TokenType.REFRESH)
            new_jti = new_payload.get("jti")
            
            await self.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$pull": {"active_refresh_tokens": old_jti},
                    "$push": {"active_refresh_tokens": new_jti}
                }
            )
        except Exception as e:
            logger.error(f"Failed to replace refresh token: {e}")

    async def _record_failed_login(self, user_id: ObjectId):
        """Record failed login attempt"""
        try:
            await self.users.update_one(
                {"_id": user_id},
                {
                    "$inc": {"security_settings.failed_login_attempts": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            # Check if we need to lock the account
            user_doc = await self.users.find_one({"_id": user_id})
            if user_doc:
                failed_attempts = user_doc.get("security_settings", {}).get("failed_login_attempts", 0)
                if failed_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                    lock_until = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
                    await self.users.update_one(
                        {"_id": user_id},
                        {"$set": {"security_settings.locked_until": lock_until}}
                    )
        except Exception as e:
            logger.error(f"Failed to record failed login: {e}")

    async def _clear_failed_attempts(self, user_id: ObjectId):
        """Clear failed login attempts"""
        try:
            await self.users.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "security_settings.failed_login_attempts": 0,
                        "security_settings.locked_until": None,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            logger.error(f"Failed to clear failed attempts: {e}")

    async def _update_login_stats(self, user_id: str):
        """Update user login statistics"""
        try:
            await self.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {"usage_stats.last_login": datetime.utcnow()},
                    "$inc": {"usage_stats.login_count": 1}
                }
            )
        except Exception as e:
            logger.error(f"Failed to update login stats: {e}")

    # Session management methods
    async def add_session_to_user(self, user_id: str, session_id: str):
        """Add a session ID to user's session list"""
        try:
            await self.users.update_one(
                {"_id": ObjectId(user_id)}, 
                {
                    "$push": {"sessions": session_id},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        except Exception as e:
            logger.error(f"Failed to add session to user: {e}")

    async def remove_session_from_user(self, user_id: str, session_id: str):
        """Remove a session ID from user's session list"""
        try:
            await self.users.update_one(
                {"_id": ObjectId(user_id)}, 
                {
                    "$pull": {"sessions": session_id},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        except Exception as e:
            logger.error(f"Failed to remove session from user: {e}")


auth_service = AuthService()
