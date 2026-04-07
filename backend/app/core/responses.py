from typing import Any, Optional
from app.models.response import ApiResponse
from app.models.status import HTTPStatus
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

def success_response(data=None, message="Success", status_code=200):
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(
            ApiResponse.success_response(
                data=data,
                message=message,
                status_code=status_code
            )
        )
    )

def error_response(
    message: str = "Something went wrong",
    status_code: int = HTTPStatus.BAD_REQUEST,
    data: Optional[Any] = None,
):
    return ApiResponse.error_response(message=message, status_code=status_code, data=data)

