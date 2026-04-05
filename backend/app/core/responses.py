from typing import Any, Optional
from app.model import ApiResponse
from app.core.status import HTTPStatus


def success_response(data: Any = None, message: str = "Success", status_code: int = HTTPStatus.OK):
    return ApiResponse.success_response(data=data, message=message, status_code=status_code)


def error_response(
    message: str = "Something went wrong",
    status_code: int = HTTPStatus.BAD_REQUEST,
    data: Optional[Any] = None,
):
    return ApiResponse.error_response(message=message, status_code=status_code, data=data)
