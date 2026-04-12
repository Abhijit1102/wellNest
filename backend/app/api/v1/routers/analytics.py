from fastapi import APIRouter, Depends, Query
from app.core.responses import success_response
from app.services.analytics_service import analytics_service
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/summary")
async def get_summary(days: int = Query(7, ge=1, le=365), current_user=Depends(get_current_user)):
    data = await analytics_service.get_summary(current_user.id, days)
    return success_response(data=data)


@router.get("/emotion-trends")
async def get_emotion_trends(
    days: int = Query(7, ge=1, le=365), current_user=Depends(get_current_user)
):
    data = await analytics_service.get_emotion_trends(current_user.id, days)
    return success_response(data=data)


@router.get("/streaks")
async def get_streaks(current_user=Depends(get_current_user)):
    data = await analytics_service.get_streaks(current_user.id)
    return success_response(data=data)
