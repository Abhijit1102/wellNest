from app.core.logging import get_logger
from bson import ObjectId
from app.core.time_zone import get_iso_timestamp, get_iso_date_before 
from app.core.database import mongodb
from app.models.mood_log import MoodLog
from app.schemas.mood import MoodCreate
from app.services.ai_service.mood_log_generation import generate_structured_mood_log

logger = get_logger(__name__)

class MoodService:
    @property
    def collection(self):
        return mongodb.get_collection("mood_logs")

    # ✅ CREATE
    async def create_mood(self, user_id: ObjectId, data: MoodCreate):
        # AI-driven structured data generation
        structured_data = generate_structured_mood_log(data.mood_score, data.notes)
        
        # Use ISO string for the date field
        entry_model = MoodLog(
            user_id=str(user_id),
            date=get_iso_timestamp(),
            mood_score=structured_data.mood_score,
            emotions=structured_data.emotions,
            energy_level=structured_data.energy_level,
            sleep_hours=structured_data.sleep_hours,
            activities=structured_data.activities,
            notes=structured_data.notes,
        )

        new_entry_dict = entry_model.model_dump(by_alias=True, exclude_none=True)
        result = await self.collection.insert_one(new_entry_dict)

        entry_model.id = result.inserted_id
        return entry_model

    # ✅ GET ALL
    async def get_user_moods(self, user_id: ObjectId, limit: int = 30, skip: int = 0):
        # Using ObjectId directly. Lexicographical sort on ISO string 'date'
        cursor = (
            self.collection.find({"user_id": str(user_id)})
            .sort("date", -1)
            .skip(skip)
            .limit(limit)
        )
        entries = await cursor.to_list(length=limit)

        result = []
        for entry in entries:
            try:
                # Pydantic MoodLog handles the conversion of fields automatically
                result.append(MoodLog(**entry))
            except Exception as e:
                logger.error(f"❌ VALIDATION ERROR for mood entry {entry.get('_id')}: {e}")
                continue

        total = await self.collection.count_documents({"user_id": user_id})
        return result, total

    # ✅ ANALYTICS / TRENDS
    async def get_mood_trends(self, user_id: ObjectId, days: int = 30):
        # ✅ Get ISO string for the start date
        start_date_iso = get_iso_date_before(days)

        pipeline = [
            {
                "$match": {
                    "user_id": str(user_id), 
                    "date": {"$gte": start_date_iso} # ✅ String-to-string comparison
                }
            },
            {
                "$group": {
                    # Slicing the ISO string 'YYYY-MM-DDTHH:MM:SSZ' to get 'YYYY-MM-DD'
                    "_id": {"$substr": ["$date", 0, 10]}, 
                    "average_mood": {"$avg": "$mood_score"},
                }
            },
            {"$sort": {"_id": 1}},
        ]

        cursor = self.collection.aggregate(pipeline)
        trends = [
            {"date": doc["_id"], "average_mood": round(doc["average_mood"], 2)}
            async for doc in cursor
        ]
        return trends

mood_service = MoodService()