from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.core.database import mongodb
from app.models.user import User
from app.models.status import HTTPStatus
from app.models.apiError import ApiError

# This points to your login endpoint for Swagger UI "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/register")

from bson import ObjectId

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_access_token(token)
    
    if not payload:
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid or expired token",
        )

    # ✅ FIX: use user_id, not email
    user_id: str = payload.get("sub")
    if not user_id:
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Token payload missing subject",
        )

    user_collection = mongodb.get_collection("users")

    try:
        user_data = await user_collection.find_one({
            "_id": ObjectId(user_id)
        })
    except Exception:
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid user ID in token",
        )

    if not user_data:
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="User not found"
        )

    return User(**user_data)