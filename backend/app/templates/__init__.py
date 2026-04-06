"""
Templates module for WellNest backend.

Contains all database / domain models:
- User model
- Mood tracking model
- Journal entries
- Reports
"""

# -------------------------

# -------------------------
# User & Auth Models
# -------------------------
from .email_template import reset_password_email_template

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
    "import reset_password_email_template",
    # "Mood",
    # "Journal",
    # "Report",
]
