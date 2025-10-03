#!/usr/bin/env python3
"""
Setup script for AI Interview Prep application.
This script helps you get the application running quickly.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database_init import initialize_database, create_test_user
from app.core.config import settings


async def setup_application():
    """Complete application setup"""
    print("🚀 Setting up AI Interview Prep application...")
    print(f"📊 Database URI: {settings.MONGO_URI[:50]}...")
    
    # Create necessary directories
    directories = ["uploads", "exports"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 Created directory: {directory}")
    
    # Initialize database
    print("\n🗄️  Initializing database...")
    db_success = await initialize_database()
    
    if not db_success:
        print("❌ Database initialization failed!")
        return False
    
    # Create test user for development
    if settings.DEBUG:
        print("\n👤 Creating test user for development...")
        await create_test_user()
    
    print("\n✅ Application setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Start the backend server:")
    print("   cd backend")
    print("   python main.py")
    print("\n2. Start the frontend server:")
    print("   cd frontend")
    print("   npm run dev")
    print("\n3. Visit http://localhost:3000 to use the application")
    
    if settings.DEBUG:
        print("\n🧪 Test credentials:")
        print("   Email: test@example.com")
        print("   Password: testpassword123")
    
    return True


def check_environment():
    """Check if all required environment variables are set"""
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file or environment")
        return False
    
    return True


if __name__ == "__main__":
    print("🔧 AI Interview Prep - Setup Script")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    try:
        success = asyncio.run(setup_application())
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)