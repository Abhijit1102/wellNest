import logging
from bson import ObjectId
from pymongo import ReturnDocument
from fastapi import BackgroundTasks

from app.core.database import mongodb
from app.models.journal import JournalEntry
from app.schemas.journal import JournalCreate, JournalUpdate
from app.core.time_zone import get_iso_timestamp
from app.core.decoder_encoder import encrypt_text, decrypt_text
from app.services.ai_service.journal_generation import generate_structured_journal
from app.services.background_task.create_mood_log_from_journal import create_mood_log_from_journal

logger = logging.getLogger(__name__)

class JournalService:
    @property
    def collection(self):
        return mongodb.get_collection("journal_entries")

    # ✅ CREATE
    async def create_journal(
        self, user_id: ObjectId, data: JournalCreate, background_tasks: BackgroundTasks
    ):
        structured_data = generate_structured_journal(
            content=data.content, 
            title=getattr(data, "title", None)
        )

        encrypted_content = await encrypt_text(structured_data.content)

        entry_model = JournalEntry(
            user_id=str(user_id), # Standardizing as string
            content=encrypted_content,
            **structured_data.model_dump(exclude={'content'}),
        )

        new_entry_dict = entry_model.model_dump(by_alias=True, exclude_none=True)
        result = await self.collection.insert_one(new_entry_dict)
        
        entry_model.id = result.inserted_id
        # Return plain text to the user so they see what they just wrote
        entry_model.content = structured_data.content

        background_tasks.add_task(
            create_mood_log_from_journal,
            user_id=str(user_id),
            title=getattr(data, "title", ""),
            content=data.content,
        )

        return entry_model

    # ✅ GET ALL
    async def get_user_journals(self, user_id: ObjectId, limit: int = 50, skip: int = 0):
        query = {"user_id": str(user_id)}
        cursor = (
            self.collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        entries = await cursor.to_list(length=limit)

        result = []
        for entry in entries:
            try:
                # Decrypt content with safety fallback
                try:
                    entry["content"] = await decrypt_text(entry["content"])
                except Exception:
                    entry["content"] = "[Decryption Error]"

                # Map _id to id for Pydantic
                entry["id"] = str(entry.pop("_id"))
                result.append(JournalEntry(**entry))
            except Exception as e:
                logger.error(f"❌ VALIDATION ERROR for entry {entry.get('id')}: {e}")
                continue

        total = await self.collection.count_documents(query)
        return result, total

    # ✅ UPDATE
    async def update_journal(self, journal_id: str, user_id: ObjectId, data: JournalUpdate):
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return None

        if "content" in update_data:
            # We encrypt the content for storage
            raw_content = update_data["content"]
            update_data["content"] = await encrypt_text(raw_content)

        update_data["updated_at"] = get_iso_timestamp()

        updated_doc = await self.collection.find_one_and_update(
            {"_id": ObjectId(journal_id), "user_id": str(user_id)},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        
        if not updated_doc:
            return None

        # Return with decrypted content
        try:
            updated_doc["content"] = await decrypt_text(updated_doc["content"])
        except Exception:
            updated_doc["content"] = "[Decryption Error]"
            
        updated_doc["id"] = str(updated_doc.pop("_id"))
        return JournalEntry(**updated_doc)

    # ✅ GET SINGLE
    async def get_journal_by_id(self, journal_id: str, user_id: ObjectId):
        entry = await self.collection.find_one(
            {"_id": ObjectId(journal_id), "user_id": str(user_id)}
        )
        if not entry:
            return None
            
        try:
            entry["content"] = await decrypt_text(entry["content"])
        except Exception:
            entry["content"] = "[Decryption Error]"

        entry["id"] = str(entry.pop("_id"))
        return JournalEntry(**entry)

    # ✅ DELETE
    async def delete_journal(self, journal_id: str, user_id: ObjectId):
        result = await self.collection.delete_one(
            {"_id": ObjectId(journal_id), "user_id": str(user_id)}
        )
        return result.deleted_count > 0

journal_service = JournalService()