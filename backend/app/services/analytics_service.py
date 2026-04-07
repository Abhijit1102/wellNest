from bson import ObjectId
from datetime import timedelta
from app.core.time_zone import get_utc_now
from app.core.database import mongodb


class AnalyticsService:
    @property
    def mood_collection(self):
        return mongodb.get_collection("mood_logs")

    @property
    def journal_collection(self):
        return mongodb.get_collection("journal_entries")

    # ✅ GET SUMMARY
    async def get_summary(self, user_id: ObjectId, days: int = 30):
        user_id = ObjectId(user_id)

        start_date = get_utc_now() - timedelta(days=days)

        # 🔹 Common match filter
        match_filter = {"user_id": user_id, "date": {"$gte": start_date}}

        print("DEBUG FILTER:", match_filter)

        # 1️⃣ Total Mood Entries
        total_moods = await self.mood_collection.count_documents(match_filter)

        # 2️⃣ TRUE Average Mood (correct way)
        avg_pipeline = [
            {"$match": match_filter},
            {"$group": {"_id": None, "avgMood": {"$avg": "$mood_score"}}},
        ]

        avg_cursor = self.mood_collection.aggregate(avg_pipeline)
        avg_result = [doc async for doc in avg_cursor]

        avg_mood = round(avg_result[0]["avgMood"], 2) if avg_result else 0

        # 3️⃣ Mood Trend (daily average for charts)
        trend_pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                    "value": {"$avg": "$mood_score"},
                }
            },
            {"$sort": {"_id": 1}},
        ]

        trend_cursor = self.mood_collection.aggregate(trend_pipeline)
        mood_trend = [
            {"date": doc["_id"], "value": round(doc["value"], 2)} async for doc in trend_cursor
        ]

        # 4️⃣ Top Emotions
        emotion_pipeline = [
            {"$match": match_filter},
            {"$unwind": "$emotions"},
            {"$group": {"_id": "$emotions", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5},
        ]

        emotion_cursor = self.mood_collection.aggregate(emotion_pipeline)
        top_emotions = [doc["_id"] async for doc in emotion_cursor]

        # ✅ Final Response
        return {
            "total_mood_entries": total_moods,
            "average_mood": avg_mood,  # ✅ correct average
            "mood_trend": mood_trend,  # for charts
            "top_emotions": top_emotions,
        }

    # ✅ GET EMOTION TRENDS
    async def get_emotion_trends(self, user_id: ObjectId, days: int = 30):
        start_date = get_utc_now() - timedelta(days=days)

        pipeline = [
            {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
            {"$unwind": "$emotions"},
            {"$group": {"_id": "$emotions", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]

        cursor = self.mood_collection.aggregate(pipeline)
        results = [{"emotion": doc["_id"], "count": doc["count"]} async for doc in cursor]

        total = sum(r["count"] for r in results)
        for r in results:
            r["percentage"] = round((r["count"] / total) * 100, 1) if total > 0 else 0

        return results

    # ✅ GET STREAKS (Logic for consecutive days)
    async def get_streaks(self, user_id: ObjectId):
        # Fetch all dates where user logged a mood
        cursor = self.mood_collection.find({"user_id": user_id}, {"date": 1}).sort("date", -1)
        dates = [doc["date"].date() async for doc in cursor]
        dates = sorted(list(set(dates)), reverse=True)  # Unique sorted dates

        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        if dates:
            today = today = get_utc_now().date()
            # Check current streak
            check_date = today
            for d in dates:
                if d == check_date:
                    current_streak += 1
                    check_date -= timedelta(days=1)
                elif d == check_date - timedelta(days=1):
                    continue  # Should not happen with unique set
                else:
                    if d < check_date:
                        break

            # Calculate longest streak
            if len(dates) > 0:
                temp_streak = 1
                for i in range(len(dates) - 1):
                    if (dates[i] - dates[i + 1]).days == 1:
                        temp_streak += 1
                    else:
                        longest_streak = max(longest_streak, temp_streak)
                        temp_streak = 1
                longest_streak = max(longest_streak, temp_streak)

        return [{"type": "mood", "current": current_streak, "longest": longest_streak}]


analytics_service = AnalyticsService()
