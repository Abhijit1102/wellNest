from bson import ObjectId
from datetime import datetime, timedelta
from app.core.time_zone import get_iso_timestamp, get_iso_date_before
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

        start_date_str = get_iso_date_before(days)

        # 🔹 Common match filter
        match_filter = {"user_id": str(user_id), "date": {"$gte": start_date_str}}

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
                    "_id": {"$substr": ["$date", 0, 10]}, # Extracts YYYY-MM-DD from ISO string
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
        # ✅ Use the helper to get an ISO string (e.g., "2026-03-09T10:48:11Z")
        start_date_iso = get_iso_date_before(days)

        pipeline = [
            {
                "$match": {
                    "user_id": str(user_id), 
                    # ✅ Comparing String to String (ISO format)
                    "date": {"$gte": start_date_iso}
                }
            },
            {"$unwind": "$emotions"},
            {"$group": {"_id": "$emotions", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]

        cursor = self.mood_collection.aggregate(pipeline)
        
        # Extract results from the cursor
        results = [
            {"emotion": doc["_id"], "count": doc["count"]} 
            async for doc in cursor
        ]

        # Calculate percentages for the frontend
        total = sum(r["count"] for r in results)
        for r in results:
            r["percentage"] = round((r["count"] / total) * 100, 1) if total > 0 else 0

        return results
    
    # ✅ GET STREAKS (Logic for consecutive days)
    async def get_streaks(self, user_id: ObjectId):
        # 1. Fetch dates as ISO strings
        cursor = self.mood_collection.find(
            {"user_id": str(user_id)}, 
            {"date": 1}
        ).sort("date", -1)
        
        # 2. Parse ISO strings to unique date objects
        raw_dates = []
        async for doc in cursor:
            # Replace 'Z' with UTC offset for standard Python parsing
            dt_str = doc["date"].replace("Z", "+00:00")
            raw_dates.append(datetime.fromisoformat(dt_str).date())
        
        # Unique sorted dates (Newest to Oldest)
        dates = sorted(list(set(raw_dates)), reverse=True)

        current_streak = 0
        longest_streak = 0

        if dates:
            # 3. Get 'Today' using your ISO utility logic
            now_iso = get_iso_timestamp().replace("Z", "+00:00")
            today = datetime.fromisoformat(now_iso).date()
            yesterday = today - timedelta(days=1)

            # 4. Calculate Current Streak
            # A streak is valid if it starts today OR yesterday
            if dates[0] == today or dates[0] == yesterday:
                check_date = dates[0]
                for d in dates:
                    if d == check_date:
                        current_streak += 1
                        check_date -= timedelta(days=1)
                    else:
                        break

            # 5. Calculate Longest Streak (Standard logic)
            temp_streak = 1
            for i in range(len(dates) - 1):
                if (dates[i] - dates[i + 1]).days == 1:
                    temp_streak += 1
                else:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)

        return [{
            "type": "mood", 
            "current": current_streak, 
            "longest": longest_streak
        }]

analytics_service = AnalyticsService()
