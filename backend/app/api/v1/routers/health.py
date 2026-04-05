from fastapi import APIRouter
from datetime import datetime

from app.core import success_response, error_response, get_logger, HTTPStatus

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

        return success_response(message="Service is healthy", data=data, status_code=HTTPStatus.OK)

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")

        return error_response(
            message="Health check failed",
            data={"error": str(e)},
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )
