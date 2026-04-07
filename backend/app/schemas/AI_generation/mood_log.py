from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class MoodLogSchema(BaseModel):
    mood_score: int = Field(
        ..., ge=1, le=10, description="Overall mood rating from 1 (low) to 10 (high)"
    )

    emotions: List[str] = Field(
        default_factory=list,
        max_length=10,
        description="List of emotions felt (e.g., happy, anxious, calm)",
    )

    energy_level: Optional[int] = Field(
        default=None, ge=1, le=5, description="Energy level from 1 (low) to 5 (high)"
    )

    sleep_hours: Optional[float] = Field(
        default=None, ge=0, le=24, description="Number of hours slept"
    )

    activities: List[str] = Field(
        default_factory=list, description="Activities performed during the day"
    )

    notes: Optional[str] = Field(
        default=None, max_length=500, description="Additional notes about the day"
    )

    model_config = ConfigDict(
        from_attributes=True,
    )
