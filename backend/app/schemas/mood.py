from pydantic import BaseModel, Field
from typing import Optional
from typing_extensions import Annotated


class MoodCreate(BaseModel):
    # Mood score between 0 and 10 using Annotated
    mood_score: Annotated[int, Field(ge=0, le=10, description="Mood score from 0 to 10")]

    # Optional notes
    notes: Optional[str] = None
