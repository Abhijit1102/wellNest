from bson import ObjectId
from datetime import timedelta
from app.core.time_zone import get_utc_now
import logging

from app.core.database import mongodb
from app.models.mood_log import MoodLog
from app.schemas.mood import MoodCreate
from app.services.ai_service.mood_log_generation import generate_structured_mood_log

logger = logging.getLogger(__name__)


class MoodService:
    @property
    def collection(self):
        return mongodb.get_collection("mood_logs")

    # ✅ CREATE
    async def create_mood(self, user_id: ObjectId, data: MoodCreate):
        data = generate_structured_mood_log(data.mood_score, data.notes)
        entry_model = MoodLog(
            user_id=user_id,
            date=get_utc_now(),
            mood_score=data.mood_score,
            emotions=data.emotions,
            energy_level=data.energy_level,
            sleep_hours=data.sleep_hours,
            activities=data.activities,
            notes=data.notes,
        )

        new_entry_dict = entry_model.model_dump(by_alias=True, exclude_none=True)
        result = await self.collection.insert_one(new_entry_dict)

        entry_model.id = result.inserted_id
        return entry_model

    # ✅ GET ALL (Consistent with Journal logic)
    async def get_user_moods(self, user_id: ObjectId, limit: int = 30, skip: int = 0):
        cursor = (
            self.collection.find({"user_id": str(user_id)}).sort("date", -1).skip(skip).limit(limit)
        )
        entries = await cursor.to_list(length=limit)

        result = []
        for entry in entries:
            try:
                # Convert Mongo ObjectIds to strings for the model
                entry["id"] = str(entry["_id"])
                entry["user_id"] = str(entry["user_id"])
                entry.pop("_id", None)

                result.append(MoodLog(**entry))
            except Exception as e:
                logger.error(f"❌ VALIDATION ERROR for mood entry {entry.get('_id')}: {e}")
                continue

        total = await self.collection.count_documents({"user_id": str(user_id)})
        return result, total

    # ✅ ANALYTICS
    async def get_mood_trends(self, user_id: ObjectId, days: int = 30):
        start_date = get_utc_now() - timedelta(days=days)

        pipeline = [
            {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
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
