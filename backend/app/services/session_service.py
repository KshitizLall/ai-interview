from datetime import datetime
from typing import Optional, List
from bson import ObjectId

from app.core.mongo import get_database
from app.models.schemas import InterviewSession, SessionCreate, SessionUpdate, Question
from app.services.auth_service import auth_service


class SessionService:
    def __init__(self):
        self.db = get_database()
        self.sessions = self.db.get_collection("interview_sessions")

    async def create_session(self, user_id: str, session_data: SessionCreate) -> InterviewSession:
        """Create a new interview session for a user"""
        session_doc = {
            "user_id": user_id,
            "company_name": session_data.company_name,
            "job_title": session_data.job_title,
            "resume_filename": session_data.resume_filename,
            "resume_text": session_data.resume_text,
            "job_description": session_data.job_description,
            "questions": [],
            "answers": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }

        result = await self.sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)
        session_doc["id"] = session_id

        # Add session to user's session list
        await auth_service.add_session_to_user(user_id, session_id)

        return InterviewSession(**session_doc)

    async def get_session(self, session_id: str, user_id: str) -> Optional[InterviewSession]:
        """Get a specific session by ID (only if it belongs to the user)"""
        session_doc = await self.sessions.find_one({
            "_id": ObjectId(session_id),
            "user_id": user_id
        })
        
        if not session_doc:
            return None
            
        session_doc["id"] = str(session_doc["_id"])
        return InterviewSession(**session_doc)

    async def get_user_sessions(self, user_id: str, active_only: bool = True) -> List[InterviewSession]:
        """Get all sessions for a user"""
        query = {"user_id": user_id}
        if active_only:
            query["is_active"] = True

        sessions = []
        async for session_doc in self.sessions.find(query).sort("updated_at", -1):
            session_doc["id"] = str(session_doc["_id"])
            sessions.append(InterviewSession(**session_doc))

        return sessions

    async def update_session(self, session_id: str, user_id: str, session_update: SessionUpdate) -> Optional[InterviewSession]:
        """Update a session (only if it belongs to the user)"""
        update_data = {k: v for k, v in session_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()

        result = await self.sessions.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return None

        return await self.get_session(session_id, user_id)

    async def add_questions_to_session(self, session_id: str, user_id: str, questions: List[Question]) -> Optional[InterviewSession]:
        """Add questions to a session"""
        # Convert questions to dict format for MongoDB
        questions_dict = [q.dict() for q in questions]
        
        result = await self.sessions.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {
                "$set": {
                    "questions": questions_dict,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return None

        return await self.get_session(session_id, user_id)

    async def update_session_answers(self, session_id: str, user_id: str, answers: dict) -> Optional[InterviewSession]:
        """Update answers in a session"""
        result = await self.sessions.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {
                "$set": {
                    "answers": answers,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return None

        return await self.get_session(session_id, user_id)

    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Soft delete a session (mark as inactive)"""
        result = await self.sessions.update_one(
            {"_id": ObjectId(session_id), "user_id": user_id},
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Remove session from user's session list
        if result.modified_count > 0:
            await auth_service.remove_session_from_user(user_id, session_id)

        return result.modified_count > 0

    async def permanently_delete_session(self, session_id: str, user_id: str) -> bool:
        """Permanently delete a session"""
        result = await self.sessions.delete_one({
            "_id": ObjectId(session_id),
            "user_id": user_id
        })

        # Remove session from user's session list
        if result.deleted_count > 0:
            await auth_service.remove_session_from_user(user_id, session_id)

        return result.deleted_count > 0

    async def get_session_stats(self, session_id: str, user_id: str) -> Optional[dict]:
        """Get statistics for a session"""
        session = await self.get_session(session_id, user_id)
        if not session:
            return None

        total_questions = len(session.questions)
        answered_questions = len([q for q in session.questions if session.answers.get(q.id)])
        completion_percentage = (answered_questions / total_questions * 100) if total_questions > 0 else 0

        return {
            "total_questions": total_questions,
            "answered_questions": answered_questions,
            "completion_percentage": completion_percentage,
            "last_updated": session.updated_at
        }

    async def search_sessions(self, user_id: str, query: str) -> List[InterviewSession]:
        """Search sessions by company name or job title"""
        search_query = {
            "user_id": user_id,
            "is_active": True,
            "$or": [
                {"company_name": {"$regex": query, "$options": "i"}},
                {"job_title": {"$regex": query, "$options": "i"}}
            ]
        }

        sessions = []
        async for session_doc in self.sessions.find(search_query).sort("updated_at", -1):
            session_doc["id"] = str(session_doc["_id"])
            sessions.append(InterviewSession(**session_doc))

        return sessions

    async def auto_name_session(self, session_id: str, user_id: str) -> Optional[str]:
        """Automatically generate a session name based on content"""
        session = await self.get_session(session_id, user_id)
        if not session:
            return None

        name = None
        
        # Try to extract company name from job description
        if session.job_description:
            lines = session.job_description.strip().split('\n')
            first_line = lines[0].strip()
            
            # Look for common patterns in job descriptions
            if 'at ' in first_line.lower():
                company_part = first_line.lower().split('at ')[-1]
                name = company_part.title()
            elif len(first_line) < 100:  # Likely a title line
                name = first_line

        # Fallback to company name if provided
        if not name and session.company_name:
            name = session.company_name

        # Fallback to generic name with timestamp
        if not name:
            user_sessions = await self.get_user_sessions(user_id)
            session_number = len(user_sessions)
            name = f"Interview Session #{session_number}"

        return name


session_service = SessionService()