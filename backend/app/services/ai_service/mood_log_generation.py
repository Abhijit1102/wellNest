from typing import Optional
from langchain_core.messages import HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from app.schemas.AI_generation.mood_log import MoodLogSchema
from app.prompt.mood_log_generation import system_message

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
def generate_structured_mood_log(
    mood_score: int,
    notes: Optional[str] = None
) -> MoodLogSchema:
    """
    Generate structured mood log with strict enforcement.
    """

   

    user_message = HumanMessage(
        content=(
            f"mood_score: {mood_score}\n"
            f"notes: {notes if notes else 'None'}"
        )
    )

    try:
        response: MoodLogSchema = _structured_llm.invoke(
            [system_message, user_message]
        )

        # 🔥 HARD ENFORCEMENT (never trust LLM fully)
        response.mood_score = mood_score

        return response

    except Exception:
        # ✅ Safe fallback
        return MoodLogSchema(
            mood_score=mood_score,
            emotions=[],
            energy_level=None,
            sleep_hours=None,
            activities=[],
            notes=notes,
        )