from pydantic import BaseModel, EmailStr
from typing import Optional
from .user import UserConsentSchema, UserProfileSchema

# Request to create/register user
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    consent: UserConsentSchema 
    profile: Optional[UserProfileSchema] = None


# Request to login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Response for user (no password)
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
