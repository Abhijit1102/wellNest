from enum import Enum
from pydantic import BaseModel
from typing import Optional


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserProfileSchema(BaseModel):
    age: Optional[int] = None
    timezone: Optional[str] = "UTC"
    avatar_url: Optional[str] = None


class UserConsentSchema(BaseModel):
    data_collection: bool
    ai_training: bool
