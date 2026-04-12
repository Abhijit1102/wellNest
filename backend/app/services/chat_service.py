from typing import Optional
from bson import ObjectId
from app.models.chat_session import ChatSession, ChatMessage
from app.schemas.chat_session import SendMessageRequest
from app.core.logging import get_logger
from app.services.ai_service.chat_coversation_generation import generate_chat_message, generate_chat_message_stream
from app.core.database import mongodb
from app.core.time_zone import get_iso_timestamp 
from app.utils.lanhchain_utility import format_chat_history
from typing import List
from langchain_core.messages import BaseMessage
from app.prompt.chat_conversation import create_system_message
from fastapi.responses import StreamingResponse
import json

logger = get_logger(__name__)

class ChatService:

    @property
    def collection(self):
        return mongodb.get_collection("chat_history")
    
    @property
    def users(self):
        return mongodb.get_collection("users")
    
    # --------------------------------------------
    # get User info from DB
    # --------------------------------------------
    async def user_info(self, user_id: str) -> dict:
        try:
            
            user = await self.users.find_one(
                {"_id": ObjectId(user_id)}
            )

            if not user:
                return {
                    "name": "User",
                    "age": None
                }

            return {
                "name": user.get("full_name", "User"),
                "age": user.get("profile", {}).get("age", None)
            }

        except Exception as e:
            logger.error(f"Error fetching user info: {e}")
            return {
                "name": "User",
                "age": None
            }

    # -------------------------
    # Create Conversation
    # -------------------------
    async def create_conversation(self, user_id: str) -> dict:
        session = ChatSession(user_id=user_id)

        await self.collection.insert_one(session.model_dump(by_alias=True))

        return {
            "id": session.session_id,
            "conversation_id": session.session_id,
            "created_at": session.created_at
        }
    

    # -------------------------
    # List all conversations
    # -------------------------
    async def list_conversation(self, user_id: str) -> List[dict]:
        cursor = self.collection.find(
            {"user_id": user_id}
        ).sort("updated_at", -1)

        conversations = []

        async for conv in cursor:
            # Get title from first message
            title = "Untitled"
            if "messages" in conv and len(conv["messages"]) > 0:
                title = conv["messages"][0].get("content", "Untitled")

                # Optional: truncate long titles
                title = title[:50]

            conversations.append({
                "id": conv["session_id"],
                "conversation_id": conv["session_id"],
                "title": title,
                "created_at": conv["created_at"],
                "updated_at": conv.get("updated_at", conv["created_at"])
            })

        return conversations 

    # -------------------------
    # Get Conversation History
    # -------------------------
    async def get_history(self, session_id: str, user_id: str) -> Optional[dict]:
        session = await self.collection.find_one({
            "session_id": session_id,
            "user_id": user_id
        })

        if not session:
            return None

        return {
            "conversation_id": session["session_id"],
            "created_at": session["created_at"],
            "messages": [
                {
                    "id": str(i),
                    "conversation_id": session["session_id"],
                    "user_id": session["user_id"],
                    "content": msg["content"],
                    "is_user": msg["role"] == "user",
                    "created_at": msg["timestamp"]
                }
                for i, msg in enumerate(session.get("messages", []))
            ]
        }

    # -------------------------
    # AI Reply
    # -------------------------
    async def generate_ai_reply(
        self,
        system_message,
        user_message: str,
        chat_history: List[BaseMessage]
    ):
        try:
            return await generate_chat_message(system_message, user_message, chat_history)
        except Exception as e:
            logger.error(f"AI generation failed: {str(e)}")
            return 0, "I'm here with you. Can you tell me more?"
        
    # -------------------------
    # Send Message streaming
    # -------------------------
    async def stream_message(self, user_id: str, payload: SendMessageRequest):

        async def event_generator():
            session = await self.collection.find_one({
                "session_id": payload.conversation_id,
                "user_id": user_id
            })

            if not session:
                yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
                return

            # -------------------------
            # User message
            # -------------------------
            user_msg = ChatMessage(
                role="user",
                content=payload.message
            ).model_dump()

            # -------------------------
            # Prepare AI
            # -------------------------
            user = await self.user_info(user_id)
            system_message = create_system_message(user["name"], user["age"])

            chat_history = await self.get_history(payload.conversation_id, user_id)
            formatted_history = format_chat_history(chat_history)

            full_response = ""
            total_tokens = 0

            # -------------------------
            # STREAM AI RESPONSE
            # -------------------------
            async for chunk in generate_chat_message_stream(
                system_message,
                payload.message,
                formatted_history
            ):
                content = chunk.get("content", "")
                token = chunk.get("token", 0)

                full_response += content
                total_tokens += token

                yield f"data: {json.dumps({'content': content})}\n\n"

            # -------------------------
            # Save to DB
            # -------------------------
            ai_msg = ChatMessage(
                role="assistant",
                content=full_response,
                tokens=total_tokens
            ).model_dump()

            await self.collection.update_one(
                {"session_id": payload.conversation_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [user_msg, ai_msg]
                        }
                    },
                    "$set": {
                        "updated_at": get_iso_timestamp()
                    }
                }
            )

            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")    

    # -------------------------
    # Send Message
    # -------------------------
    async def process_message(self, user_id: str, payload: SendMessageRequest):

        session = await self.collection.find_one({
            "session_id": payload.conversation_id,
            "user_id": user_id
        })

        # ❌ DO NOT AUTO-CREATE silently
        if not session:
            return None

        # -------------------------
        # User Message
        # -------------------------
        user_msg = ChatMessage(
            role="user",
            content=payload.message
        ).model_dump()

        # 1. Get user
        user = await self.user_info(user_id)

        # 2. Create system prompt
        system_message = create_system_message(user["name"], user["age"])

        # 3. Get history
        chat_history = await self.get_history(payload.conversation_id, user_id)
        formated_chat_history = format_chat_history(chat_history)

        # 4. Generate AI response
        token, ai_content = await self.generate_ai_reply(
            system_message,
            payload.message,
            formated_chat_history
        )
        
        ai_msg = ChatMessage(
            role="assistant",
            content=ai_content,
            tokens=token,
        ).model_dump()

        # -------------------------
        # Update DB
        # -------------------------
        await self.collection.update_one(
            {"session_id": payload.conversation_id},
            {
                "$push": {
                    "messages": {
                        "$each": [user_msg, ai_msg]
                    }
                },
                "$set": {
                    "updated_at": get_iso_timestamp()
                }
            }
        )

        return {
            "id": payload.conversation_id,
            "conversation_id": payload.conversation_id,
            "content": ai_msg["content"],
            "message": "Reply generated",
            "is_user": False,
            "created_at": ai_msg["timestamp"]
        }

    # -------------------------
    # Delete Conversation
    # -------------------------
    async def delete_conversation(self, session_id: str, user_id: str) -> bool:
        result = await self.collection.delete_one({
            "session_id": session_id,
            "user_id": user_id
        })
        return result.deleted_count > 0
    

chat_service = ChatService()    