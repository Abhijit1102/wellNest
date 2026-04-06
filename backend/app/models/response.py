from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    statusCode: int
    success: bool
    message: str
    data: Optional[T] = None

    class Config:
        from_attributes = True  # for ORM support (Pydantic v2)

    @classmethod
    def success_response(
        cls,
        data: Optional[T] = None,
        message: str = "Success",
        status_code: int = 200,
    ):
        return cls(
            statusCode=status_code,
            success=True,
            message=message,
            data=data,
        )

    @classmethod
    def error_response(
        cls,
        message: str = "Something went wrong",
        status_code: int = 400,
        data: Optional[T] = None,
    ):
        return cls(
            statusCode=status_code,
            success=False,
            message=message,
            data=data,
        )
