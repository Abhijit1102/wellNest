"""
Schamas module for WellNest backend.

Contains all database / domain models:
- User model
- Mood tracking model
- Journal entries
- Reports
"""

# -------------------------
#  Api Response Model

from .auth import UserCreate,  UserLogin,  UserResponse

# -------------------------

# -------------------------
# User & Auth Models
# -------------------------
# from .user import User

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
    "UserCreate",
    "UserLogin",
    "UserResponse"
    # "User",
    # "Mood",
    # "Journal",
    # "Report",
]
