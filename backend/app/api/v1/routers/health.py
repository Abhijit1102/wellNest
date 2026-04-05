from fastapi import APIRouter
from datetime import datetime

from app.config import settings
from app.core import success_response, error_response, get_logger, HTTPStatus
from app.core.database import db, get_database
from pymongo.errors import PyMongoError

router = APIRouter(tags=["Health"])
logger = get_logger(__name__)


@router.get("")
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

        return error_response(
            message="Health check failed",
            data={"error": str(e)},
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )


@router.get("/db", tags=["Health"])
async def db_health_check():
    """
    Ping MongoDB to check if the connection is alive.
    Uses the db singleton via get_database().
    """
    try:
        await db.client.admin.command("ping")
        data = {
            "status": "ok",
            "service": f"database : {settings.DATABASE_NAME} is running ok!",
            "timestamp": datetime.now().isoformat(),
        }
        return success_response(message="Server is healthy", data=data, status_code=HTTPStatus.OK)

    except PyMongoError as e:

        logger.error(f"Health check failed: {str(e)}")

        return error_response(
            message=f"Health check failed : {str(e)}",
            data={"error": str(e)},
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )
