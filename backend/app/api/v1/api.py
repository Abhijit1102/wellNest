"""
Main API router for v1.
"""

from fastapi import APIRouter
from .routers import api_router as routers_v1

api_router = APIRouter()
api_router.include_router(routers_v1)
