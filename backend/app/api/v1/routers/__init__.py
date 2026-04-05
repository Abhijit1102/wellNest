"""
API v1 Routers Aggregator.

Collects all route modules and attaches them to a single APIRouter.
"""

from fastapi import APIRouter

# Import individual routers
from .health import router as health_router

# from .auth import router as auth_router
# from .mood import router as mood_router

api_router = APIRouter()

# Register routes
api_router.include_router(health_router, prefix="/health", tags=["Health"])
# api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
# api_router.include_router(mood_router, prefix="/mood", tags=["Mood"])

__all__ = ["api_router"]
