from langchain_core.messages import HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from app.prompt.chat_conversation import system_message

# Initialize LLM
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.5,
    max_tokens=1024,
)

async def generate_chat_message(message: str, chat_history) -> str:
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
        print(f"[LLM ERROR]: {str(e)}")
        return "I'm here for you. Would you like to share more?"