from fastapi import APIRouter
from app.core.responses import success_response, error_response
from app.core.logging import get_logger
from app.models.status import HTTPStatus
from app.models.apiError import ApiError
from app.schemas import UserCreate, UserLogin, UserResponse
from app.services.auth_service import create_user, authenticate_user, create_user_token, get_user_by_email

router = APIRouter(tags=["auth"])
logger = get_logger(__name__)

@router.post("/register")
async def register(user: UserCreate):
    logger.info(f"Register request for email: {user.email}")
    
    # Check if user exists
    existing = await get_user_by_email(user.email)
    if existing:
        logger.warning(f"User already exists: {user.email}")
        raise ApiError(status_code=HTTPStatus.BAD_REQUEST, message="User already exists")
    
    new_user = await create_user(user.email, user.username, user.password)
    token = await create_user_token(new_user)
    
    return success_response(
        message="User registered successfully",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "username": new_user.username
            }
        },
        status_code=HTTPStatus.CREATED
    )

@router.post("/login")
async def login(user: UserLogin):
    logger.info(f"Login request for email: {user.email}")
    
    auth_user = await authenticate_user(user.email, user.password)
    if not auth_user:
        logger.warning(f"Invalid credentials for email: {user.email}")
        raise ApiError(status_code=HTTPStatus.UNAUTHORIZED, message="Invalid credentials")
    
    token = await create_user_token(auth_user)
    return success_response(
        message="Login successful",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(auth_user.id),
                "email": auth_user.email,
                "username": auth_user.username
            }
        },
        status_code=HTTPStatus.OK
    )