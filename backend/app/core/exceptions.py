from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.responses import error_response
from app.models import ApiError
from app.core.logging import get_logger

logger = get_logger(__name__)


async def api_exception_handler(request: Request, exc: ApiError):
    logger.error(f"API Error: {exc.message}")

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.message, data={"errors": exc.errors}).model_dump(),
    )
