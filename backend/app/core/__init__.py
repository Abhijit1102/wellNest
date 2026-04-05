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

# Status
from .status import HTTPStatus

__all__ = [
    # logging
    "get_logger",
    # # database
    # "Base",
    # "engine",
    # "get_db",
    # # security
    # "create_access_token",
    # "verify_token",
    # "get_password_hash",
    # "verify_password",
    # responses & exceptions
    "success_response",
    "error_response",
    "api_exception_handler",
    "HTTPStatus",
    # # middleware
    # "register_middleware",
]
