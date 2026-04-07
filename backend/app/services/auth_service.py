from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.database import mongodb
from bson import ObjectId
from datetime import timedelta
from app.core.time_zone import get_utc_now
from app.config import settings
from fastapi import HTTPException, status


async def create_user(user_in: UserCreate) -> User:
    users_col = mongodb.get_collection("users")

    now = get_utc_now()

    # Prepare the document for MongoDB
    user_dict = {
        "email": user_in.email.lower(),
        "full_name": user_in.full_name,
        "password_hash": hash_password(user_in.password),
        "role": "user",
        "is_active": True,
        "profile": user_in.profile.model_dump() if user_in.profile else {"timezone": "UTC"},
        "consent": user_in.consent.model_dump(),  # Storing the UI consent
        "created_at": now,
        "updated_at": now,
    }

    result = await users_col.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return User(**user_dict)


async def get_user_by_email(email: str):
    users_col = mongodb.get_collection("users")
    user_doc = await users_col.find_one({"email": email})
    if not user_doc:
        return None
    return User(**user_doc)


async def authenticate_user(email: str, password: str):
    users_col = mongodb.get_collection("users")

    user_doc = await users_col.find_one({"email": email.lower()})
    if not user_doc:
        return False

    user = User(**user_doc)

    # ❌ Wrong password
    if not verify_password(password, user.password_hash):
        return False

    # ✅ Update last_login in DB using user_doc
    now = get_utc_now()

    await users_col.update_one(
        {"_id": user_doc["_id"]}, {"$set": {"last_login": now, "updated_at": now}}
    )

    # ✅ Update in-memory object (VERY IMPORTANT)
    user.last_login = now
    user.updated_at = now

    return user


async def create_user_token(user: User):
    payload = {"sub": str(user.id), "email": user.email}
    token = create_access_token(payload)
    return token


async def get_current_user(token: str) -> User:
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    users_col = mongodb.get_collection("users")

    user_doc = await users_col.find_one({"_id": ObjectId(user_id)})

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return User(**user_doc)


async def generate_password_reset_token(user: User):
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": get_utc_now() + timedelta(minutes=settings.RESET_TOKEN_EXPIRY_MINUTES),
    }
    return create_access_token(payload)


async def reset_password(token: str, new_password: str):
    from app.core.security import decode_access_token

    payload = decode_access_token(token)
    user_id = payload.get("sub")

    users_col = mongodb.get_collection("users")
    hashed = hash_password(new_password)
    await users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"hashed_password": hashed}})
    user_doc = await users_col.find_one({"_id": ObjectId(user_id)})
    return User(**user_doc)
