from bson import ObjectId
from app.models.mood_log import MoodLog
from app.core.database import mongodb
from app.core.time_zone import get_iso_timestamp
from app.services.ai_service.mood_log_from_journal_generation import (
    generate_structured_mood_log_from_journal,
)


async def create_mood_log_from_journal(user_id: ObjectId, title: str, content: str):
    """
    Generate a MoodLog from a journal entry and insert into MongoDB.
    """
    # Use AI service to extract mood info
    mood_data = generate_structured_mood_log_from_journal(title=title, content=content)

    # Build MoodLog model
    entry_model = MoodLog(
        user_id=user_id,
        date=get_iso_timestamp(),
        mood_score=mood_data.mood_score,
        emotions=mood_data.emotions,
        energy_level=mood_data.energy_level,
        sleep_hours=mood_data.sleep_hours,
        activities=mood_data.activities,
        notes=mood_data.notes,
    )

    # Insert into MongoDB
    new_entry_dict = entry_model.model_dump(by_alias=True, exclude_none=True)
    collection = mongodb.get_collection("mood_logs")
    await collection.insert_one(new_entry_dict)
