from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
from langchain_openai import ChatOpenAI

# Initialize LLM
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.5,
    max_tokens=1024,
)


async def generate_chat_message(message: str) -> str:
    try:
        system_message = SystemMessage(
            content=(
                "You are a compassionate AI mental health assistant. "
                "Be empathetic, supportive, and concise."
            )
        )

        user_message = HumanMessage(content=message)

        response = await _llm.ainvoke([system_message, user_message])

        return response.content.strip()

    except Exception as e:
        print(f"[LLM ERROR]: {str(e)}")
        return "I'm here for you. Would you like to share more?"