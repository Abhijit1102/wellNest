from fastapi import APIRouter, BackgroundTasks, APIRouter, Header, Depends, HTTPException
from app.core.responses import success_response
from app.core.logging import get_logger, setup_logging
from app.models.status import HTTPStatus
from app.models.apiError import ApiError
from app.core.security import decode_access_token

from app.schemas import UserCreate, UserLogin, PasswordResetRequest, PasswordResetConfirm

from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_user_token,
    get_user_by_email,
    generate_password_reset_token,
    reset_password,
    get_current_user,
)

from app.services.email_service import send_reset_password_email

router = APIRouter(tags=["auth"])
setup_logging()
logger = get_logger(__name__)


# -----------------------------
# ✅ REGISTER
# -----------------------------
@router.post("/register")
async def register(user_in: UserCreate):
    logger.info(f"Register request for email: {user_in.email}")

    existing = await get_user_by_email(user_in.email)
    if existing:
        raise ApiError(status_code=HTTPStatus.BAD_REQUEST, message="User already exists")

    # The user_in object already contains validated 'consent' from UI
    new_user = await create_user(user_in)

    token = await create_user_token(new_user)

    return success_response(
        message="User registered successfully",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "full_name": new_user.full_name,
                "consent": new_user.consent.model_dump(),
            },
        },
        status_code=HTTPStatus.CREATED,
    )


# -----------------------------
# ✅ LOGIN
# -----------------------------
@router.post("/login")
async def login(user: UserLogin):
    logger.info(f"Login request for email: {user.email}")

    auth_user = await authenticate_user(user.email, user.password)
    if not auth_user:
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
                "full_name": auth_user.full_name,
                "profile": auth_user.profile.model_dump() if auth_user.profile else {},
            },
        },
        status_code=HTTPStatus.OK,
    )


# -----------------------------
# ✅ VERIFY TOKEN (Used by Next.js proxy.ts)
# -----------------------------
@router.get("/verify")
async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    user = await get_current_user(token)

    if not user:
        raise HTTPException(status_code=401, detail="User session expired or user deleted")
    
    data = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "profile": user.profile.model_dump() if user.profile else {},
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }

    return success_response(message="Token valid", data=data, status_code=HTTPStatus.OK)

# -----------------------------
# ✅ REQUEST PASSWORD RESET
# -----------------------------
@router.post("/request-password-reset")
async def request_password_reset(req: PasswordResetRequest, background_tasks: BackgroundTasks):
    logger.info(f"Password reset request for: {req.email}")

    user = await get_user_by_email(req.email)

    # ✅ Don't reveal user existence (security)
    if user:
        token = await generate_password_reset_token(user)

        # ✅ Send email in background
        background_tasks.add_task(send_reset_password_email, user.email, token)

        logger.info(f"Reset email queued for: {user.email}")

    return success_response(
        message="If this email exists, a reset link was sent", status_code=HTTPStatus.OK
    )


# -----------------------------
# ✅ RESET PASSWORD
# -----------------------------
@router.post("/reset-password")
async def password_reset(req: PasswordResetConfirm):
    logger.info("Password reset attempt")

    user = await reset_password(req.token, req.new_password)

    if not user:
        raise ApiError(status_code=HTTPStatus.BAD_REQUEST, message="Invalid or expired token")

    return success_response(message="Password reset successful", status_code=HTTPStatus.OK)
