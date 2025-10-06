#!/usr/bin/env python3
"""
Database management CLI for AI Interview application.
Usage: python db_cli.py [command]
"""

import asyncio
import sys
import argparse
from app.core.database_init import (
    initialize_database, 
    get_database_stats, 
    create_test_user,
    verify_database_connection
)
from app.core.mongo import get_database


async def reset_database():
    """Reset the database by dropping all collections"""
    print("⚠️  This will delete ALL data in the database!")
    confirm = input("Type 'CONFIRM' to proceed: ")
    
    if confirm != "CONFIRM":
        print("❌ Database reset cancelled")
        return
    
    db = get_database()
    collections = await db.list_collection_names()
    
    for collection_name in collections:
        await db.drop_collection(collection_name)
        print(f"🗑️  Dropped collection: {collection_name}")
    
    print("✅ Database reset completed")


async def show_stats():
    """Show database statistics"""
    stats = await get_database_stats()
    
    print(f"\n📊 Database Statistics")
    print(f"Database: {stats['database_name']}")
    print(f"Collections: {len(stats['collections'])}")
    
    for collection_name, collection_stats in stats['collections'].items():
        print(f"  - {collection_name}: {collection_stats['document_count']} documents")


async def create_sample_data():
    """Create sample data for testing"""
    print("🔧 Creating sample data...")
    
    # Create test user
    await create_test_user()
    
    # Create sample session data
    from app.services.session_service import session_service
    from app.models.schemas import SessionCreate, Question, QuestionType, QuestionDifficulty
    from datetime import datetime
    
    try:
        # Get the test user
        from app.services.auth_service import auth_service
        user = await auth_service.authenticate_user("test@example.com", "testpassword123")
        
        if not user:
            print("❌ Test user not found. Please run 'init' first.")
            return
        
        # Create sample session
        sample_session = SessionCreate(
            company_name="Google",
            job_title="Software Engineer",
            resume_text="Experienced software developer with 5 years in Python and JavaScript...",
            job_description="We are looking for a Software Engineer to join our team..."
        )
        
        session = await session_service.create_session(user.id, sample_session)
        
        # Add sample questions
        sample_questions = [
            Question(
                id="q1",
                question="Tell me about yourself and your experience with Python.",
                type=QuestionType.BEHAVIORAL,
                difficulty=QuestionDifficulty.INTERMEDIATE,
                relevance_score=0.9,
                created_at=datetime.utcnow()
            ),
            Question(
                id="q2", 
                question="How would you design a scalable web application?",
                type=QuestionType.TECHNICAL,
                difficulty=QuestionDifficulty.ADVANCED,
                relevance_score=0.8,
                created_at=datetime.utcnow()
            ),
            Question(
                id="q3",
                question="Describe a challenging project you worked on.",
                type=QuestionType.EXPERIENCE,
                difficulty=QuestionDifficulty.INTERMEDIATE,
                relevance_score=0.85,
                created_at=datetime.utcnow()
            )
        ]
        
        await session_service.add_questions_to_session(session.id, user.id, sample_questions)
        
        # Add sample answers
        sample_answers = {
            "q1": "I am a passionate software developer with 5 years of experience...",
            "q2": "To design a scalable web application, I would start by...",
        }
        
        await session_service.update_session_answers(session.id, user.id, sample_answers)
        
        print("✅ Sample data created successfully")
        print(f"   - Test user: test@example.com (password: testpassword123)")
        print(f"   - Sample session: {session.company_name} - {session.job_title}")
        print(f"   - Sample questions: {len(sample_questions)}")
        print(f"   - Sample answers: {len(sample_answers)}")
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")


async def main():
    parser = argparse.ArgumentParser(description="Database management CLI for AI Interview application")
    parser.add_argument("command", choices=[
        "init", "reset", "stats", "test", "sample"
    ], help="Command to execute")
    
    args = parser.parse_args()
    
    if args.command == "init":
        print("🚀 Initializing database...")
        success = await initialize_database()
        if success:
            print("\n✅ Database ready! You can now start the application.")
        else:
            print("\n❌ Database initialization failed!")
            sys.exit(1)
            
    elif args.command == "reset":
        await reset_database()
        
    elif args.command == "stats":
        await show_stats()
        
    elif args.command == "test":
        print("🧪 Testing database connection...")
        success = await verify_database_connection()
        if success:
            await show_stats()
        else:
            sys.exit(1)
            
    elif args.command == "sample":
        await create_sample_data()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)