"""
Models module for WellNest backend.

Contains all database / domain models:
- User model
- Mood tracking model
- Journal entries
- Reports
"""

# -------------------------
#  Api Response Model

from .response import ApiResponse
from .apiError import ApiError
from .status import HTTPStatus

# -------------------------

# -------------------------
# User & Auth Models
# -------------------------
from .user import User

# -------------------------
# Wellness Models
# -------------------------
# from .mood import Mood
# from .journal import Journal

# -------------------------
# Reports & Analytics
# -------------------------
# from .report import Report

# -------------------------
# Exports
# -------------------------
__all__ = [
    "ApiResponse",
    "ApiError",
    "User",
    # "Mood",
    # "Journal",
    # "Report",
]
