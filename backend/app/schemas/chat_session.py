from pydantic import BaseModel
from typing import Optional, List

# ==================== MODELS ====================
class ConversationCreateRequest(BaseModel):
    """Request model for creating a conversation"""
    pass


class ConversationResponse(BaseModel):
    """Response model for conversation"""
    id: str
    conversation_id: str
    created_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2026-04-08T10:30:00Z"
            }
        }


class ChatMessage(BaseModel):
    """Chat message model"""
    id: str
    conversation_id: str
    user_id: str
    content: str
    is_user: bool
    created_at: str


class ChatHistoryResponse(BaseModel):
    """Response model for chat history"""
    conversation_id: str
    messages: List[ChatMessage]
    created_at: str


class SendMessageRequest(BaseModel):
    """Request model for sending a message"""
    conversation_id: str
    message: str


class SendMessageResponse(BaseModel):
    """Response model for sent message"""
    id: str
    conversation_id: str
    content: str
    message: str
    is_user: bool
    created_at: str