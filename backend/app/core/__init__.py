"""
Core module for WellNest backend.

Contains foundational components:
- Security utilities (JWT, hashing)
- Logging configuration
- Database connection & session management
- Custom exceptions and response handlers
- Middleware components
"""

# Logging
from .logging import get_logger

# Responses & Exceptions
from .responses import success_response, error_response
from .exceptions import api_exception_handler

# Database
from .database import mongodb

# Status
from app.models.status import HTTPStatus

# Sscurity
from .security import create_access_token, decode_access_token, hash_password, verify_password

__all__ = [
    # logging
    "get_logger",
    # # database
    mongodb,
    # security
    "create_access_token",
    "verify_token",
    "hash_password",
    "decode_access_token",
    # responses & exceptions
    "success_response",
    "error_response",
    "api_exception_handler",
    "HTTPStatus",
    # # middleware
    # "register_middleware",
]
