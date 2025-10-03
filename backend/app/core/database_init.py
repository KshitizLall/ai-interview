"""
Database initialization and setup for the AI Interview application.
This module handles creating collections, indexes, and initial data.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.mongo import get_database
from app.core.config import settings
import asyncio
from datetime import datetime


async def create_indexes():
    """Create indexes for better query performance"""
    db = get_database()
    
    # Users collection indexes
    users_collection = db.users
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("created_at")
    await users_collection.create_index("tokens")  # For token validation
    
    # Interview sessions collection indexes
    sessions_collection = db.interview_sessions
    await sessions_collection.create_index("user_id")
    await sessions_collection.create_index([("user_id", 1), ("is_active", 1)])
    await sessions_collection.create_index([("user_id", 1), ("updated_at", -1)])  # For listing sessions
    await sessions_collection.create_index([("user_id", 1), ("company_name", "text"), ("job_title", "text")])  # For search
    await sessions_collection.create_index("created_at")
    await sessions_collection.create_index("updated_at")
    
    print("✅ Database indexes created successfully")


async def create_collections():
    """Ensure all required collections exist"""
    db = get_database()
    
    # Get existing collections
    existing_collections = await db.list_collection_names()
    
    required_collections = [
        "users",
        "interview_sessions"
    ]
    
    for collection_name in required_collections:
        if collection_name not in existing_collections:
            await db.create_collection(collection_name)
            print(f"✅ Created collection: {collection_name}")
        else:
            print(f"ℹ️  Collection already exists: {collection_name}")


async def verify_database_connection():
    """Verify that we can connect to the database"""
    try:
        db = get_database()
        # Try to ping the database
        await db.command("ping")
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


async def initialize_database():
    """Initialize the database with collections and indexes"""
    print("🚀 Initializing database...")
    
    # Verify connection
    if not await verify_database_connection():
        return False
    
    # Create collections
    await create_collections()
    
    # Create indexes
    await create_indexes()
    
    print("✅ Database initialization completed successfully!")
    return True


async def get_database_stats():
    """Get database statistics"""
    db = get_database()
    
    stats = {
        "database_name": db.name,
        "collections": {}
    }
    
    collections = await db.list_collection_names()
    
    for collection_name in collections:
        collection = db[collection_name]
        count = await collection.count_documents({})
        stats["collections"][collection_name] = {
            "document_count": count
        }
    
    return stats


async def create_test_user():
    """Create a test user for development purposes"""
    from app.services.auth_service import auth_service
    from app.models.schemas import UserCreate
    
    try:
        test_user = UserCreate(
            name="Test User",
            email="test@example.com",
            password="testpassword123"
        )
        
        # Check if user already exists
        existing_user = await auth_service.authenticate_user("test@example.com", "testpassword123")
        if existing_user:
            print("ℹ️  Test user already exists")
            return existing_user
        
        # Create new test user
        user = await auth_service.create_user(test_user)
        print(f"✅ Created test user: {user.email}")
        return user
        
    except ValueError as e:
        if "already exists" in str(e):
            print("ℹ️  Test user already exists")
        else:
            print(f"❌ Failed to create test user: {e}")
    except Exception as e:
        print(f"❌ Error creating test user: {e}")


if __name__ == "__main__":
    # Run the initialization
    asyncio.run(initialize_database())