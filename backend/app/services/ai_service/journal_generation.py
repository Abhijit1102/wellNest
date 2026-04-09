from typing import Optional
from langchain_core.messages import HumanMessage
from app.config import settings
from langchain_openai import ChatOpenAI
from app.schemas.AI_generation.journal import JournalSchema
from app.prompt.journal_generation import system_message

# Initialize LLM
_llm = ChatOpenAI(
    model=settings.NVIDIA_MODEL_NAME,
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL,
    temperature=0.5,
    max_tokens=1024,
)

_structured_llm = _llm.with_structured_output(JournalSchema)


def generate_structured_journal(content: str, title: Optional[str] = None) -> JournalSchema:
    """
    Generates a structured journal entry using AI using system + user messages.
    """
    
    user_message = HumanMessage(
        content=(
            f"Title: {title if title else 'None'}\n"
            f"Content: {content}"
        )
    )

    response: JournalSchema = _structured_llm.invoke(
        [system_message, user_message]
    )

    return response