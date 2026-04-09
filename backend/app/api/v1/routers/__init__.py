"""
API v1 Routers Aggregator.

Collects all route modules and attaches them to a single APIRouter.
"""

from fastapi import APIRouter

# Import individual routers
from .health import router as health_router
from .auth import router as auth_router
from .journal import router as journal_router
from .mood_log import router as moodlog_router
from .analytics import router as analytics_router
from .user import router as user_router
from .chat import router as chat_router

# from .mood import router as mood_router

api_router = APIRouter()

# Register routes
api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(journal_router, prefix="/journal", tags=["Journal"])
api_router.include_router(moodlog_router, prefix="/moods", tags=["Mood Log"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Mood Log"])
api_router.include_router(user_router, prefix="/users", tags=["User"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])

__all__ = ["api_router"]
