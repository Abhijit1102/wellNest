from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, Request
from typing import Optional
from app.core.responses import success_response
from app.models.status import HTTPStatus
from app.dependencies import get_current_user
from app.services.user_service import user_service
from app.models.user import User
from app.core.time_zone import get_iso_timestamp
from app.services.cloudinary_service import upload_image_to_cloudinary

from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

class UserUpdateForm:
    def __init__(
        self,
        username: Optional[str] = Form(None),
        age: Optional[int] = Form(None, ge=0, le=120),
        file: Optional[UploadFile] = File(None),
    ):
        self.username = username
        self.age = age
        self.file = file

# -----------------------------
# ✅ GET PROFILE
# -----------------------------
@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    return success_response(
        message="User profile fetched",
        data={
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "profile": current_user.profile.model_dump()
            if current_user.profile
            else {},
            "created_at": current_user.created_at.isoformat(),
        },
        status_code=HTTPStatus.OK,
    )


# -----------------------------
# ✅ UPDATE PROFILE
# -----------------------------
@router.put("/me")
async def update_profile(
    request: Request,
    form: UserUpdateForm = Depends(),
    current_user: User = Depends(get_current_user),
):
    # --- DEBUGGING LINE: Check your console to see if data arrives ---
    logger.debug(f"DEBUG: Raw Form Data: {await request.form()}")
    
    update_data = {}

    logger.debug(f"Username in form: {form.username}")

    if form.username:
        update_data["username"] = form.username.strip()

    if form.age is not None:
        update_data["age"] = form.age

    if form.file:
        try:
            avatar_url, public_id = await upload_image_to_cloudinary(form.file)
            update_data["avatar_url"] = avatar_url
            update_data["avatar_public_id"] = public_id
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return success_response(message="Image upload failed", status_code=HTTPStatus.INTERNAL_SERVER_ERROR)

    if not update_data:
        return success_response(message="No changes provided", status_code=HTTPStatus.OK)

    updated_user = await user_service.update_user(str(current_user.id), update_data)

    return success_response(
        message="Profile updated successfully",
        data={
            "id": str(updated_user["_id"]),
            "full_name": updated_user.get("full_name"),
            "profile": updated_user.get("profile", {}),
            "updated_at": updated_user.get("updated_at", get_iso_timestamp()),
        },
        status_code=HTTPStatus.OK,
    )