"""
Service module for WellNest backend.

Contains all database / domain models:
- User model
- Mood tracking model
- Journal entries
- Reports
"""
# -------------------------
#  Auth Services

from .auth_service import create_user, authenticate_user


# -------------------------
# Exports
# -------------------------
__all__ = [
    "create_user",
    "authenticate_user",
]