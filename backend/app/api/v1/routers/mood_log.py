from fastapi import APIRouter, Depends
from app.core.responses import success_response
from app.models.status import HTTPStatus
from app.schemas.mood import MoodCreate
from app.services.mood_service import mood_service
from app.dependencies import get_current_user

router = APIRouter()


# ✅ LOG MOOD
@router.post("/")
async def create_mood(mood_in: MoodCreate, current_user=Depends(get_current_user)):
    new_mood = await mood_service.create_mood(current_user.id, mood_in)

    return success_response(message="Mood logged", data=new_mood, status_code=HTTPStatus.CREATED)


# ✅ RECENT MOOD ENTRIES
@router.get("/")
async def get_moods(current_user=Depends(get_current_user), limit: int = 30, skip: int = 0):
    entries, total = await mood_service.get_user_moods(current_user.id, limit, skip)
    return success_response(data={"entries": entries, "total": total})


# ✅ MOOD TRENDS FOR CHART
@router.get("/analytics")
async def get_mood_analytics(current_user=Depends(get_current_user), days: int = 30):
    trends = await mood_service.get_mood_trends(current_user.id, days)

    return success_response(data={"trends": trends})
