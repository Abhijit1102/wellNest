from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import mongodb
from bson import ObjectId
from datetime import datetime, timedelta
from app.config import settings

async def create_user(email: str, username: str, password: str) -> User:
    users_col = mongodb.get_collection("users")
    hashed = hash_password(password)
    user_dict = {"email": email, "username": username, "hashed_password": hashed, "is_active": True}
    result = await users_col.insert_one(user_dict)
    return User(id=result.inserted_id, **user_dict)

async def get_user_by_email(email: str):
    users_col = mongodb.get_collection("users")
    user_doc = await users_col.find_one({"email": email})
    if not user_doc:
        return None
    return User(**user_doc)

async def authenticate_user(email: str, password: str):
    users_col = mongodb.get_collection("users")
    user_doc = await users_col.find_one({"email": email})
    if not user_doc:
        return None
    user = User(**user_doc)
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def create_user_token(user: User):
    payload = {"sub": str(user.id), "email": user.email}
    token = create_access_token(payload)
    return token


async def generate_password_reset_token(user: User):
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=settings.RESET_TOKEN_EXPIRY_MINUTES)
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