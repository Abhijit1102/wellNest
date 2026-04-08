from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.time_zone import get_localzone
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.database import mongodb
from bson import ObjectId
from datetime import timedelta
from app.core.time_zone import get_iso_timestamp
from app.config import settings
from fastapi import HTTPException, status


async def create_user(user_in: UserCreate) -> User:
    users_col = mongodb.get_collection("users")

    now_iso = get_iso_timestamp()

    # Prepare the document for MongoDB
    user_dict = {
        "email": user_in.email.lower(),
        "full_name": user_in.full_name,
        "password_hash": hash_password(user_in.password),
        "role": "user",
        "is_active": True,
        "profile": user_in.profile.model_dump() if user_in.profile else {"timezone": str(get_localzone())},
        "consent": user_in.consent.model_dump(),
        "created_at": now_iso,
        "updated_at": now_iso,
        "last_login": now_iso,
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

    # 1. Fetch the document
    user_doc = await users_col.find_one({"email": email.lower()})
    if not user_doc:
        return False

    # 2. Verify password
    if not verify_password(password, user_doc["password_hash"]):
        return False

    # 3. Generate the ISO String (e.g., "2026-04-08T10:55:00Z")
    now_iso = get_iso_timestamp()

    # 4. Update the database with the ISO String
    await users_col.update_one(
        {"_id": user_doc["_id"]}, 
        {
            "$set": {
                "last_login": now_iso, 
                "updated_at": now_iso
            }
        }
    )

    # 5. Update the local dict and return the Pydantic User object
    # This ensures the 'user' object returned has the latest timestamps
    user_doc["last_login"] = now_iso
    user_doc["updated_at"] = now_iso

    return User(**user_doc)


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
    """
    Note: For the JWT 'exp' claim, we pass a timedelta. 
    The security utility handles the math, but we can add our 
    ISO timestamp as a custom claim for tracking.
    """
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "purpose": "password_reset",
        "issued_at_iso": get_iso_timestamp() # ✅ Traceability
    }
    # Pass expiration delta specifically for the library to handle
    expires = timedelta(minutes=settings.RESET_TOKEN_EXPIRY_MINUTES)
    return create_access_token(payload, expires_delta=expires)


async def reset_password(token: str, new_password: str):
    payload = decode_access_token(token)
    if not payload or payload.get("purpose") != "password_reset":
         raise HTTPException(status_code=400, detail="Invalid reset token")

    user_id = payload.get("sub")
    users_col = mongodb.get_collection("users")
    
    now_iso = get_iso_timestamp()
    hashed = hash_password(new_password)
    
    await users_col.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$set": {"password_hash": hashed, "updated_at": now_iso}}
    )
    
    user_doc = await users_col.find_one({"_id": ObjectId(user_id)})
    return User(**user_doc)
