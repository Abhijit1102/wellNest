from bson import ObjectId
from pymongo import ReturnDocument
from app.core.database import mongodb
from app.core.time_zone import get_iso_timestamp  

class UserService:
    @property
    def collection(self):
        return mongodb.get_collection("users")

    async def get_user_by_id(self, user_id: str):
        # Always return the document directly; Pydantic can handle the conversion later
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def update_user(self, user_id: str, data: dict):
        update_data = {}

        # 🔹 Map frontend keys to DB fields
        if "username" in data and data["username"]:
            update_data["full_name"] = data["username"]

        if "age" in data:
            update_data["profile.age"] = data["age"]

        if "timezone" in data:
            update_data["profile.timezone"] = data["timezone"]

        if "avatar_url" in data:
            update_data["profile.avatar_url"] = data["avatar_url"]

        if not update_data:
            return None

        # ✅ Set the ISO string for updated_at
        update_data["updated_at"] = get_iso_timestamp()

        # ✅ Use ReturnDocument.AFTER to get the updated version of the user
        return await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)}, 
            {"$set": update_data}, 
            return_document=ReturnDocument.AFTER
        )

user_service = UserService()