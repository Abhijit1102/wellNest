from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema
from app.core.time_zone import get_utc_now


# Helper class for MongoDB ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
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


# Pydantic v2 style constraints using Annotated
MoodScore = Annotated[int, Field(ge=1, le=10)]
EnergyLevel = Annotated[Optional[int], Field(ge=1, le=5)]
SleepHours = Annotated[Optional[float], Field(ge=0, le=24)]
ShortStr = Annotated[str, Field(max_length=50)]
NotesStr = Annotated[Optional[str], Field(max_length=500)]


class MoodLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId = Field(...)
    date: datetime = Field(...)  # Start of day UTC
    mood_score: MoodScore = Field(...)
    emotions: Optional[List[ShortStr]] = Field(default_factory=list)
    energy_level: EnergyLevel = None
    sleep_hours: SleepHours = None
    activities: Optional[List[ShortStr]] = Field(default_factory=list)
    notes: NotesStr = None
    created_at: datetime = Field(default_factory=get_utc_now)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
    )
