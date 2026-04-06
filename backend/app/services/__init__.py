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

from .auth_service import (
    create_user, 
    authenticate_user, 
    get_user_by_email, 
    authenticate_user, 
    create_user_token,
    generate_password_reset_token,
    reset_password
)


# -------------------------
# Exports
# -------------------------
__all__ = [
    "create_user", 
    "authenticate_user", 
    "get_user_by_email", 
    "authenticate_user", 
    "create_user_token",
    "generate_password_reset_token",
    "reset_password"
]