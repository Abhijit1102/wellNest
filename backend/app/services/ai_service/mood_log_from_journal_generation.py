from typing import Optional
from langchain_core.messages import HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from app.schemas.AI_generation.mood_log import MoodLogSchema
from app.prompt.mood_log_from_journal_generation import system_message

# -------------------------------
# ✅ LLM INIT
# -------------------------------
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.3,
    max_tokens=500,
)

_structured_llm = _llm.with_structured_output(MoodLogSchema)


# -------------------------------
# ✅ MAIN FUNCTION
# -------------------------------
def generate_structured_mood_log_from_journal(
    content: str,
    title: Optional[str] = None
) -> MoodLogSchema:
    user_message = HumanMessage(
        content=(
            f"Title: {title if title else 'None'}\n"
            f"Content: {content if content else 'None'}"
        )
    )

    try:
        response: MoodLogSchema = _structured_llm.invoke(
            [system_message, user_message]
        )

        # 🔥 HARD SAFETY ENFORCEMENTS
        response.mood_score = max(1, min(10, response.mood_score))

        if response.energy_level is not None:
            response.energy_level = max(1, min(5, response.energy_level))

        if response.sleep_hours is not None:
            response.sleep_hours = max(0, min(24, response.sleep_hours))

        return response

    except Exception:
        # ✅ Safe fallback
        return MoodLogSchema(
            mood_score=5,  # neutral default instead of 0
            emotions=[],
            energy_level=None,
            sleep_hours=None,
            activities=[],
            notes=content if content else None,
        )