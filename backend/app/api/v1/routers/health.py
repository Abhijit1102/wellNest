from fastapi import APIRouter
from datetime import datetime

from app.config import settings
from app.core.responses import success_response, error_response
from app.core.logging import get_logger
from app.models.status import HTTPStatus
from app.models.apiError import ApiError
from app.core.database import mongodb
from pymongo.errors import PyMongoError

router = APIRouter(tags=["Health"])
logger = get_logger(__name__)


@router.get("/", tags=["Health"])
async def health_check():
    try:
        logger.info("Health check endpoint called")

        data = {
            "status": "ok",
            "service": "wellnest-backend",
            "timestamp": datetime.now().isoformat(),
        }

        return success_response(message="Server is healthy", data=data, status_code=HTTPStatus.OK)

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")

        raise ApiError(
            message="Health check failed",
            errors=[str(e)],
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )


@router.get("/db", tags=["Health"])
async def db_health_check():
    """
    Ping MongoDB to check if the connection is alive.
    """
    try:
        await mongodb._client.admin.command("ping")
        data = {
            "status": "ok",
            "service": f"database: {settings.DATABASE_NAME} is running",
            "timestamp": datetime.now().isoformat(),
        }
        return success_response(message="Database is healthy", data=data, status_code=HTTPStatus.OK)

    except PyMongoError as e:
        logger.error(f"DB health check failed: {str(e)}")
        raise ApiError(
            message=f"Database health check failed: {str(e)}",
            errors=[str(e)],
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )
