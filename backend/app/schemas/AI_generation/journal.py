from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic import ConfigDict


class JournalSchema(BaseModel):
    title: str = Field(default=None, max_length=200, description="Title of the journal entry")
    content: str = Field(..., description="The main content of the journal entry")
    tags: List[str] = Field(
        default_factory=list, description="List of tags associated with the journal entry"
    )
    sentiment_score: Optional[float] = Field(
        default=None, ge=-1.0, le=1.0, description="Sentiment score of the content (-1 to 1)"
    )

    model_config = ConfigDict(
        from_attributes=True,  # Allows mapping from regular objects/dicts
    )
