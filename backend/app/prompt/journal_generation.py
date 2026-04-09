from langchain_core.messages import SystemMessage

system_message = SystemMessage(
        content=(
            "You are an AI assistant that generates structured journal summaries.\n"
            "Always follow the JournalSchema strictly.\n\n"
            "Rules:\n"
            "1. If title is missing or too long, generate a concise title (<= 200 chars).\n"
            "2. Summary must be meaningful and written in first person.\n"
            "3. Generate relevant tags.\n"
            "4. Sentiment score must be between -1 and 1.\n"
            "5. Output must strictly match the schema."
        )
    )