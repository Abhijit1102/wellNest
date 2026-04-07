from typing import Optional
from app.config import settings
from langchain_openai import ChatOpenAI
from app.schemas.AI_generation.mood_log import MoodLogSchema

# -------------------------------
# ✅ SYSTEM PROMPT (STRICT CONTROL)
# -------------------------------
SYSTEM_PROMPT = """
You are an AI assistant that generates structured mood logs.

VERY IMPORTANT RULES:
- Analyze the content and title from journal field to extract information.

Field Instructions:

1. mood_score:
   - Use score must be between 1-10.

2. emotions:
   - Understanding title and conetent from journal generate emotions Otherwise return empty list [].

3. energy_level:
   - Understanding title and conetent from journal generate energy level (1-5) else return null.

4. sleep_hours:
   - Only set if explicitly mentioned (e.g., "slept 6 hours") range from 0-24 .
   - Else return null.

5. activities:
   - Understanding notes generate activities Else return empty list [].

6. notes:
   - this notes will generate understanding user journal title and content and generate this as first person as you are user.
   - Keep meaning same.
   - If no notes → return null.

STRICT RULES:
- Do NOT hallucinate.
- Do NOT assume missing data.
- Return only valid JSON matching MoodLogSchema.
"""

# -------------------------------
# ✅ LLM INIT
# -------------------------------
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.3,  # 🔥 lower = less hallucination
    max_tokens=500,
)

_structured_llm = _llm.with_structured_output(MoodLogSchema)


# -------------------------------
# ✅ MAIN FUNCTION
# -------------------------------
def generate_structured_mood_log_from_journal(
    content: str, title: Optional[str] = None
) -> MoodLogSchema:
    """
    Generate structured mood log from user notes.
    mood_score is always preserved.
    """

    user_prompt = f"""
User Input:
Title: {title if title else 'None'}
Content: {content}
"""

    try:
        response: MoodLogSchema = _structured_llm.invoke(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]
        )


        return response

    except Exception:
        # ✅ Safe fallback
        return MoodLogSchema(
            mood_score=0,
            emotions=[],
            energy_level=None,
            sleep_hours=None,
            activities=[],
            notes="",
        )
