from typing import Optional
from app.config import settings
from langchain_openai import ChatOpenAI
from app.schemas.AI_generation.journal import JournalSchema

# Initialize the LLM once (reuse in function)
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
    Generates a structured journal entry using AI.

    Args:
        content (str): The main content of the journal entry.
        title (Optional[str]): Optional title. If None or too long, AI will generate one.

    Returns:
        JournalSchema: Validated structured journal output.
    """
    prompt = f"""
You are an AI assistant that outputs structured journal summaries following the JournalSchema.

Instructions:
1. If the title is missing or too long, generate a concise title within 200 characters summarizing the entry.
2. Summarize the content clearly and keep it meaningful and generate this as first person as you are user.
3. Generate a list of relevant keywords as 'tags'.
4. Analyze the content and give a 'sentiment_score' between -1 (very negative) and 1 (very positive).
5. Always return output strictly in the JournalSchema format.

User Input:
Title: {title if title else 'None'}
Content: {content}
"""
    # Predict structured output (already a JournalSchema object)
    response: JournalSchema = _structured_llm.invoke(prompt)

    return response
