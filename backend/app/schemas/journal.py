from pydantic import BaseModel, Field
from typing import List, Optional

class JournalCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: str  # This should be the encrypted string from the frontend/client
    tags: List[str] = []

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None