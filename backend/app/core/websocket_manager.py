"""
WebSocket Connection Manager for AI Interview Prep API

Handles WebSocket connections, message broadcasting, and connection lifecycle management.
"""

import json
import uuid
from typing import Dict, List, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and message broadcasting."""
    
    def __init__(self):
        # Store active connections with unique connection IDs
        self.active_connections: Dict[str, WebSocket] = {}
        # Map session IDs to connection IDs for targeted messaging
        self.session_connections: Dict[str, str] = {}
        
    async def connect(self, websocket: WebSocket, session_id: Optional[str] = None) -> str:
        """Accept a WebSocket connection and return a unique connection ID."""
        await websocket.accept()
        
        # Generate unique connection ID
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
        # Map session ID to connection if provided
        if session_id:
            self.session_connections[session_id] = connection_id
            
        logger.info(f"WebSocket connected: {connection_id} (session: {session_id})")
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "connection_id": connection_id,
            "timestamp": asyncio.get_event_loop().time()
        }, connection_id)
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection."""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
            
        # Remove from session mapping
        session_to_remove = None
        for session_id, conn_id in self.session_connections.items():
            if conn_id == connection_id:
                session_to_remove = session_id
                break
                
        if session_to_remove:
            del self.session_connections[session_to_remove]
            
        logger.info(f"WebSocket disconnected: {connection_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific connection."""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
            except WebSocketDisconnect:
                self.disconnect(connection_id)
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def send_to_session(self, message: Dict[str, Any], session_id: str):
        """Send a message to a specific session."""
        if session_id in self.session_connections:
            connection_id = self.session_connections[session_id]
            await self.send_personal_message(message, connection_id)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients."""
        if not self.active_connections:
            return
            
        message_text = json.dumps(message)
        disconnected_connections = []
        
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message_text)
            except WebSocketDisconnect:
                disconnected_connections.append(connection_id)
            except Exception as e:
                logger.error(f"Error broadcasting to {connection_id}: {e}")
                disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)
    
    async def send_progress_update(self, session_id: str, progress: Dict[str, Any]):
        """Send progress update for question generation or other long-running tasks."""
        message = {
            "type": "progress_update",
            "data": progress,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_to_session(message, session_id)
    
    async def send_answer_saved(self, session_id: str, question_id: str, answer: str):
        """Send confirmation that an answer was saved."""
        message = {
            "type": "answer_saved",
            "data": {
                "question_id": question_id,
                "answer": answer,
                "saved_at": asyncio.get_event_loop().time()
            },
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_to_session(message, session_id)
    
    async def send_questions_generated(self, session_id: str, questions: List[Dict[str, Any]]):
        """Send newly generated questions to the client."""
        message = {
            "type": "questions_generated",
            "data": {
                "questions": questions,
                "count": len(questions)
            },
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_to_session(message, session_id)
    
    async def send_error(self, session_id: str, error_message: str, error_type: str = "general"):
        """Send an error message to the client."""
        message = {
            "type": "error",
            "data": {
                "message": error_message,
                "error_type": error_type
            },
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_to_session(message, session_id)
    
    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)
    
    def get_session_count(self) -> int:
        """Get the number of active sessions."""
        return len(self.session_connections)


# Global connection manager instance
manager = ConnectionManager()