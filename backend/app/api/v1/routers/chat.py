from fastapi import APIRouter, Depends
from typing import List

from app.services.chat_service import chat_service
from app.dependencies import get_current_user
from app.core.responses import success_response
from app.core.logging import get_logger
from app.models.status import HTTPStatus
from app.models.apiError import ApiError
from app.schemas.chat_session import (
    ChatHistoryResponse,
    ConversationResponse,
    SendMessageResponse,
    SendMessageRequest,
)

router = APIRouter(tags=["Chat"])
logger = get_logger(__name__)


# -------------------------
# Create a new conversation
# -------------------------
@router.post("/conversations", response_model=ConversationResponse)
async def create_chat(current_user=Depends(get_current_user)):
    new_conv = await chat_service.create_conversation(str(current_user.id))

    return success_response(
        message="Chat started",
        data=new_conv,
        status_code=HTTPStatus.CREATED
    )


# -------------------------
# List all conversations
# -------------------------
@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(current_user=Depends(get_current_user)):
    try:
        conversations = await chat_service.list_conversation(str(current_user.id))

        return success_response(
            message="User conversations fetched",
            data=conversations,
            status_code=HTTPStatus.OK
        )

    except Exception as e:
        logger.error(f"Failed to list conversations: {str(e)}")
        raise ApiError(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            message="Failed to fetch conversations"
        )

# -------------------------
# Get chat history
# -------------------------
@router.get("/conversations/{conversation_id}", response_model=ChatHistoryResponse)
async def get_chat_history(conversation_id: str, current_user=Depends(get_current_user)):
    history = await chat_service.get_history(conversation_id, str(current_user.id))

    if not history:
        raise ApiError(
            status_code=HTTPStatus.NOT_FOUND,
            message="Conversation not found"
        )

    return success_response(
        message="Chat history fetched",
        data=history,
        status_code=HTTPStatus.OK
    )


# -------------------------
# Send message
# -------------------------
@router.post("/message", response_model=SendMessageResponse)
async def send_chat_message(
    payload: SendMessageRequest,
    current_user=Depends(get_current_user)
):
    ai_response = await chat_service.process_message(
        str(current_user.id),
        payload
    )

    if not ai_response:
        raise ApiError(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            message="Failed to process message"
        )

    return success_response(
        message="Reply received",
        data=ai_response,
        status_code=HTTPStatus.CREATED
    )


# -------------------------
# Delete conversation
# -------------------------
@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user=Depends(get_current_user)):
    deleted = await chat_service.delete_conversation(
        conversation_id,
        str(current_user.id)
    )

    if not deleted:
        raise ApiError(
            status_code=HTTPStatus.NOT_FOUND,
            message="Conversation not found"
        )

    return success_response(
        message="Conversation deleted",
        status_code=HTTPStatus.OK
    )