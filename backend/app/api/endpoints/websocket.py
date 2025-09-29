"""
WebSocket endpoints for real-time communication
"""

import json
import asyncio
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.websockets import WebSocketState

from app.core.websocket_manager import manager
from app.services.openai_service import OpenAIService
from app.models.schemas import GenerationOptions

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time communication.
    
    Args:
        session_id: Optional session identifier for tracking user sessions
    """
    connection_id = await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await handle_websocket_message(message, connection_id, session_id)
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "data": {"message": "Invalid JSON format", "error_type": "json_error"}
                }, connection_id)
            except Exception as e:
                await manager.send_personal_message({
                    "type": "error", 
                    "data": {"message": str(e), "error_type": "processing_error"}
                }, connection_id)
                
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(connection_id)


async def handle_websocket_message(message: dict, connection_id: str, session_id: Optional[str]):
    """Handle incoming WebSocket messages based on message type."""
    
    message_type = message.get("type")
    data = message.get("data", {})
    
    if message_type == "ping":
        # Respond to ping with pong
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": asyncio.get_event_loop().time()
        }, connection_id)
        
    elif message_type == "generate_questions":
        # Handle question generation request
        await handle_question_generation(data, session_id or connection_id)
        
    elif message_type == "save_answer":
        # Handle answer saving
        await handle_answer_save(data, session_id or connection_id)
        
    elif message_type == "generate_answer":
        # Handle AI answer generation
        await handle_answer_generation(data, session_id or connection_id)
        
    else:
        await manager.send_personal_message({
            "type": "error",
            "data": {"message": f"Unknown message type: {message_type}", "error_type": "unknown_type"}
        }, connection_id)


async def handle_question_generation(data: dict, session_id: str):
    """Handle question generation with real-time progress updates."""
    try:
        # Extract generation parameters
        resume_text = data.get("resume_text", "")
        job_description = data.get("job_description", "")
        options = data.get("options", {})
        mode = options.get("mode", "combined")
        count = options.get("count", 10)
        include_answers = options.get("include_answers", False)
        
        # Send generation started message
        await manager.send_progress_update(session_id, {
            "stage": "started",
            "message": "Starting question generation...",
            "progress": 0
        })
        
        await asyncio.sleep(0.5)
        
        await manager.send_progress_update(session_id, {
            "stage": "analyzing",
            "message": "Analyzing resume and job description...",
            "progress": 25
        })
        
        # Prepare input based on mode
        ai_resume_text = None
        ai_job_description = None
        
        if mode == "resume" or mode == "combined":
            ai_resume_text = resume_text if resume_text.strip() else None
        if mode == "jd" or mode == "combined":
            ai_job_description = job_description if job_description.strip() else None
        
        await manager.send_progress_update(session_id, {
            "stage": "generating",
            "message": "Generating AI-powered questions...",
            "progress": 60
        })
        
        # Use OpenAI service to generate real questions
        from app.services.openai_service import openai_service
        
        generated_questions = await openai_service.generate_questions(
            resume_text=ai_resume_text,
            job_description=ai_job_description,
            question_count=count,
            include_answers=include_answers
        )
        
        # Convert Question objects to dictionaries for JSON serialization
        questions = []
        for q in generated_questions:
            question_dict = {
                "id": q.id,
                "question": q.question,
                "type": q.type.value,
                "difficulty": q.difficulty.value,
                "relevance_score": q.relevance_score,
                "created_at": datetime.now().isoformat()
            }
            if q.answer:
                question_dict["answer"] = q.answer
            questions.append(question_dict)
        
        await manager.send_progress_update(session_id, {
            "stage": "completed",
            "message": "AI questions generated successfully!",
            "progress": 100
        })
        
        # Send the generated questions
        await manager.send_questions_generated(session_id, questions)
        
    except Exception as e:
        await manager.send_error(session_id, f"Error generating questions: {str(e)}", "generation_error")


async def handle_answer_save(data: dict, session_id: str):
    """Handle answer saving with immediate confirmation."""
    try:
        question_id = data.get("question_id")
        answer = data.get("answer", "")
        
        if not question_id:
            await manager.send_error(session_id, "Missing question_id", "validation_error")
            return
        
        # Simulate saving to database
        await asyncio.sleep(0.1)  # Simulate database operation
        
        # Send confirmation
        await manager.send_answer_saved(session_id, question_id, answer)
        
    except Exception as e:
        await manager.send_error(session_id, f"Error saving answer: {str(e)}", "save_error")


async def handle_answer_generation(data: dict, session_id: str):
    """Handle AI answer generation for a given question."""
    try:
        question = data.get("question", "")
        resume_text = data.get("resume_text", "")
        
        if not question:
            await manager.send_error(session_id, "Missing question", "validation_error")
            return
        
        await manager.send_progress_update(session_id, {
            "stage": "generating_answer",
            "message": "Generating AI answer...",
            "progress": 50
        })
        
        # Use OpenAI service to generate answer
        openai_service = OpenAIService()
        answer = await openai_service.generate_answer(question, resume_text)
        
        await manager.send_personal_message({
            "type": "answer_generated",
            "data": {
                "question": question,
                "answer": answer,
                "generated_at": asyncio.get_event_loop().time()
            }
        }, session_id)
        
    except Exception as e:
        await manager.send_error(session_id, f"Error generating answer: {str(e)}", "answer_generation_error")


@router.get("/ws/stats")
async def websocket_stats():
    """Get WebSocket connection statistics."""
    return {
        "active_connections": manager.get_connection_count(),
        "active_sessions": manager.get_session_count()
    }