from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal
from bson import ObjectId
from pydantic_core import core_schema
from app.core.time_zone import get_iso_timestamp


# -----------------------------
# Custom ObjectId for Pydantic
# -----------------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
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


# -----------------------------
# Chat Message Model
# -----------------------------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: str = Field(default_factory=get_iso_timestamp)
    tokens: int | None = None


# -----------------------------
# Chat Session Model
# -----------------------------
class ChatSession(BaseModel):
    id: PyObjectId = Field(alias="_id", default_factory=PyObjectId)

    user_id: str
    
    session_id: str = Field(default_factory=lambda: str(ObjectId()))

    bucket_count: int = 1
    messages: List[ChatMessage] = Field(default_factory=list)

    created_at: str = Field(default_factory=get_iso_timestamp)
    updated_at: str = Field(default_factory=get_iso_timestamp)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )