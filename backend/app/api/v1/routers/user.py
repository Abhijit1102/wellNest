from fastapi import APIRouter, Depends
from app.core.responses import success_response
from app.models.status import HTTPStatus
from app.schemas.user_profile import UserUpdate
from app.dependencies import get_current_user
from app.services.user_service import user_service
from app.models.user import User

router = APIRouter(tags=["users"])


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
            "profile": current_user.profile.model_dump(),
            "created_at": current_user.created_at.isoformat(),
        },
        status_code=HTTPStatus.OK,
    )


# -----------------------------
# ✅ UPDATE PROFILE
# -----------------------------
@router.put("/me")
async def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    updated_user = await user_service.update_user(
        str(current_user.id), payload.model_dump(exclude_unset=True)
    )

    if not updated_user:
        return success_response(message="No changes made", data={}, status_code=HTTPStatus.OK)

    return success_response(
        message="Profile updated successfully",
        data={
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "full_name": updated_user["full_name"],
            "profile": updated_user.get("profile", {}),
            "updated_at": updated_user["updated_at"].isoformat(),
        },
        status_code=HTTPStatus.OK,
    )
