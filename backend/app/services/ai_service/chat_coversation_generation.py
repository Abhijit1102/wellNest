from langchain_core.messages import HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from app.core.logging import get_logger

logger = get_logger(__name__)
# Initialize LLM
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.5,
    max_tokens=1024,
)

async def generate_chat_message(system_message: str, message: str, chat_history) -> str:
    try:
        user_message = HumanMessage(content=message)

        # ✅ Combine everything in correct order
        messages = [
            system_message,                 # system prompt first
            *chat_history,                 # past conversation
            user_message                  # latest user input LAST
        ]

        response = await _llm.ainvoke(messages)

        token = response.response_metadata["token_usage"]["total_tokens"]

        return token, response.content.strip()

    except Exception as e:
        logger.error(f"[LLM ERROR]: {str(e)}")
        return "I'm here for you. Would you like to share more?"
    
async def generate_chat_message_stream(system_message, message: str, chat_history):
    try:
        user_message = HumanMessage(content=message)

        messages = [
            system_message,
            *chat_history,
            user_message
        ]

        full_content = ""

        # 🔥 STREAM START
        async for chunk in _llm.astream(messages):
            if chunk.content:
                content = chunk.content
                full_content += content

                yield {
                    "content": content,
                    "token": 1  # approx (LangChain doesn't give per-token usage here)
                }

        # ✅ Optional: final metadata (if needed)
        yield {
            "content": "",
            "token": 0,
            "done": True,
            "full_content": full_content
        }

    except Exception as e:
        logger.error(f"[LLM STREAM ERROR]: {str(e)}")

        yield {
            "content": "I'm here for you. Would you like to share more?",
            "token": 0,
            "done": True
        }    