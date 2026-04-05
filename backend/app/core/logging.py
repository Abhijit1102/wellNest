import logging
import sys
import os
from logging.config import dictConfig
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from typing import Optional

from app.config import settings


# -----------------------------
# JSON Formatter (Production)
# -----------------------------
class JsonFormatter(logging.Formatter):
    """Structured JSON logs for production"""

    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "time": self.formatTime(record, self.datefmt),
            "logger": record.name,
        }

        # Optional fields
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id

        if hasattr(record, "user_id"):
            log_record["user_id"] = record.user_id

        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        import json

        return json.dumps(log_record)


# -----------------------------
# Setup Logging
# -----------------------------
def setup_logging():
    """Configure logging based on environment"""

    LOG_LEVEL = settings.LOG_LEVEL.upper()
    is_production = settings.ENVIRONMENT == "production"

    # Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)

    formatters = {
        "json": {
            "()": JsonFormatter,
        },
        "default": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        },
    }

    handlers = {
        # Console logs
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "json" if is_production else "default",
            "level": LOG_LEVEL,
        },
        # General app logs (rotating by size)
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 5 * 1024 * 1024,  # 5 MB
            "backupCount": 5,
            "formatter": "json" if is_production else "default",
            "level": LOG_LEVEL,
        },
        # Error logs only
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/error.log",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "json" if is_production else "default",
            "level": "ERROR",
        },
        # Optional: Daily rotating logs (uncomment if needed)
        # "daily_file": {
        #     "class": "logging.handlers.TimedRotatingFileHandler",
        #     "filename": "logs/daily.log",
        #     "when": "midnight",
        #     "backupCount": 7,
        #     "formatter": "json" if is_production else "default",
        # },
    }

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": formatters,
            "handlers": handlers,
            "root": {
                "handlers": ["console", "file", "error_file"],
                "level": LOG_LEVEL,
            },
        }
    )


# -----------------------------
# Logger Getter
# -----------------------------
def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get logger instance"""
    return logging.getLogger(name or "wellnest")
