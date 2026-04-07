from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument
import logging

from app.core.database import mongodb
from app.models.journal import JournalEntry
from app.schemas.journal import JournalCreate, JournalUpdate
from app.core.decoder_encoder import encrypt_text, decrypt_text
from app.services.ai_service.journal_generation import generate_structured_journal


logger = logging.getLogger(__name__)

class JournalService:
    @property
    def collection(self):
        return mongodb.get_collection("journal_entries")

    # ✅ CREATE
    async def create_journal(self, user_id: ObjectId, data: JournalCreate):
        # Call the function, passing content and optional title
        structured_data = generate_structured_journal(
            content=data.content,
            title=data.title if hasattr(data, "title") else None
        )

        encrypted_content = await encrypt_text(structured_data.content)
        
        entry_model = JournalEntry(
            user_id=user_id,
            content=encrypted_content,
            **structured_data.model_dump(exclude={'content'})
        )
        
        new_entry_dict = entry_model.model_dump(by_alias=True, exclude_none=True)
        result = await self.collection.insert_one(new_entry_dict)
        
        entry_model.id = result.inserted_id
        entry_model.content = structured_data.content

        return entry_model

    # ✅ GET ALL (FIXED LOGIC)
    async def get_user_journals(self, user_id: ObjectId, limit: int = 50, skip: int = 0):
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        entries = await cursor.to_list(length=limit)
        
        result = []
        for entry in entries:
            try:
                # Decrypt content safely
                try:
                    entry["content"] = await decrypt_text(entry["content"])
                except Exception as e:
                    logger.error(f"Decryption failed for {entry['_id']}: {e}")
                    entry["content"] = "[Encrypted Content - Decryption Error]"

                # Convert Mongo ObjectIds to strings
                entry["id"] = str(entry["_id"])
                entry["user_id"] = str(entry["user_id"])
                entry.pop("_id", None)  

                # Pass to Pydantic
                result.append(JournalEntry(**entry))
            except Exception as e:
                print(f"❌ VALIDATION ERROR for entry {entry.get('_id')}: {e}")
                continue
        
        total = await self.collection.count_documents({"user_id": user_id})
        return result, total

    # ✅ GET SINGLE
    async def get_journal_by_id(self, journal_id: str, user_id: ObjectId):
        try:
            entry = await self.collection.find_one({
                "_id": ObjectId(journal_id), 
                "user_id": user_id
            })
            if not entry: return None
            
            entry["content"] = await decrypt_text(entry["content"])
            return JournalEntry(**entry)
        except Exception:
            return None

    # ✅ UPDATE
    async def update_journal(self, journal_id: str, user_id: ObjectId, data: JournalUpdate):
        update_data = data.model_dump(exclude_unset=True)
        if not update_data: return None
        
        if "content" in update_data:
            update_data["content"] = await encrypt_text(update_data["content"])

        update_data["updated_at"] = datetime.utcnow()

        updated_doc = await self.collection.find_one_and_update(
            {"_id": ObjectId(journal_id), "user_id": user_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        if not updated_doc: return None
        
        updated_doc["content"] = await decrypt_text(updated_doc["content"])
        return JournalEntry(**updated_doc)

    # ✅ DELETE
    async def delete_journal(self, journal_id: str, user_id: ObjectId):
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(journal_id), 
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception:
            return False

journal_service = JournalService()