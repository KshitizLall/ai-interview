from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models.schemas import (
    InterviewSession, SessionCreate, SessionUpdate, SessionListResponse, 
    SessionResponse, SessionStatsResponse, Question
)
from app.services.session_service import session_service
from app.core.auth_middleware import auth_dep

router = APIRouter()


@router.post("/", response_model=SessionResponse)
async def create_session(session_data: SessionCreate, current_user = auth_dep.required()):
    """Create a new interview session"""
    session = await session_service.create_session(current_user.id, session_data)
    return SessionResponse(session=session)


@router.get("/", response_model=SessionListResponse)
async def get_sessions(
    active_only: bool = Query(True, description="Only return active sessions"),
    current_user = auth_dep.required()
):
    """Get all sessions for the current user"""
    sessions = await session_service.get_user_sessions(current_user.id, active_only)
    return SessionListResponse(sessions=sessions, total_sessions=len(sessions))


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, current_user = auth_dep.required()):
    """Get a specific session by ID"""
    session = await session_service.get_session(session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(session=session)


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str, 
    session_update: SessionUpdate, 
    current_user = auth_dep.required()
):
    """Update a session"""
    session = await session_service.update_session(session_id, current_user.id, session_update)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(session=session)


@router.delete("/{session_id}")
async def delete_session(session_id: str, current_user = auth_dep.required()):
    """Soft delete a session (mark as inactive)"""
    success = await session_service.delete_session(session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted successfully"}


@router.delete("/{session_id}/permanent")
async def permanently_delete_session(session_id: str, current_user = auth_dep.required()):
    """Permanently delete a session"""
    success = await session_service.permanently_delete_session(session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session permanently deleted"}


@router.post("/{session_id}/questions")
async def add_questions_to_session(
    session_id: str, 
    questions: list[Question], 
    current_user = auth_dep.required()
):
    """Add questions to a session"""
    session = await session_service.add_questions_to_session(session_id, current_user.id, questions)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(session=session)


@router.put("/{session_id}/answers")
async def update_session_answers(
    session_id: str, 
    answers: dict, 
    current_user = auth_dep.required()
):
    """Update answers in a session"""
    session = await session_service.update_session_answers(session_id, current_user.id, answers)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(session=session)


@router.get("/{session_id}/stats", response_model=SessionStatsResponse)
async def get_session_stats(session_id: str, current_user = auth_dep.required()):
    """Get statistics for a session"""
    stats = await session_service.get_session_stats(session_id, current_user.id)
    if not stats:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionStatsResponse(**stats)


@router.get("/search/")
async def search_sessions(
    q: str = Query(..., description="Search query for company name or job title"),
    current_user = auth_dep.required()
):
    """Search sessions by company name or job title"""
    sessions = await session_service.search_sessions(current_user.id, q)
    return SessionListResponse(sessions=sessions, total_sessions=len(sessions))


@router.post("/{session_id}/auto-name")
async def auto_name_session(session_id: str, current_user = auth_dep.required()):
    """Automatically generate a name for the session based on content"""
    name = await session_service.auto_name_session(session_id, current_user.id)
    if not name:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update the session with the generated name
    session_update = SessionUpdate(company_name=name)
    session = await session_service.update_session(session_id, current_user.id, session_update)
    
    return {
        "generated_name": name,
        "session": session
    }