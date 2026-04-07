from pydantic import BaseModel, Field, ConfigDict
from pydantic_core import core_schema
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId

# 1. Define the helper class to handle MongoDB ObjectIds
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.chain_schema(
                        [
                            core_schema.str_schema(),
                            core_schema.no_info_plain_validator_function(cls.validate),
                        ]
                    ),
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

# 2. Define the Journal Entry Model
class JournalEntry(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId = Field(...)
    title: Optional[str] = Field(default=None, max_length=200)
    content: str  
    tags: List[str] = Field(default_factory=list)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    is_favorite: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,      # Important: Allows using 'id' or '_id'
        from_attributes=True,      # Important: Helps with mapping DB dicts
        arbitrary_types_allowed=True,
    )