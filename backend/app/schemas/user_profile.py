from pydantic import BaseModel
from typing import Optional


class UserUpdate(BaseModel):
    username: Optional[str] = None
    age: Optional[int] = None
    timezone: Optional[str] = None
    avatar_url: Optional[str] = None
