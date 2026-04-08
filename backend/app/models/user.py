from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema
from app.schemas.user import UserRole
from app.core.time_zone import get_iso_timestamp


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


# --- Sub-Models for Registration and Consent ---


class UserProfile(BaseModel):
    age: Optional[int] = None
    timezone: Optional[str] = "UTC"
    avatar_url: Optional[str] = None


class UserConsent(BaseModel):
    data_collection: bool
    ai_training: bool


# --- Main User Model ---


class User(BaseModel):
    # Use PyObjectId here; it is now defined above
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    password_hash: str
    full_name: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    profile: UserProfile = Field(default_factory=UserProfile)
    consent: UserConsent
    created_at: str = Field(default_factory=get_iso_timestamp)
    updated_at: str = Field(default_factory=get_iso_timestamp)
    last_login: str = Field(default_factory=get_iso_timestamp)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
