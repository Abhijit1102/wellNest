from langchain_core.messages import HumanMessage, AIMessage
from datetime import datetime

def format_chat_history(chat_history: dict):
    messages = []

    # 1. Get messages
    history = chat_history.get("messages", [])

    # 2. Sort by created_at (IMPORTANT 🔥)
    history_sorted = sorted(
        history,
        key=lambda x: datetime.fromisoformat(x["created_at"].replace("Z", "+00:00"))
    )

    # 3. Convert to LangChain format
    for msg in history_sorted:
        if msg["is_user"]:
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    return messages