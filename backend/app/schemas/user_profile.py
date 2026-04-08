from pydantic import BaseModel, Field
from typing import Optional

class UserUpdate(BaseModel):
    username: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=120)
    avatar_url: Optional[str] = None