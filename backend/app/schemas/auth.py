from pydantic import BaseModel, EmailStr

# Request to create/register user
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

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