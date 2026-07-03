from pydantic import BaseModel, EmailStr

# Schema returned on successful authentication
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

# Schema for incoming login requests
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for changing passwords
class ChangePassword(BaseModel):
    old_password: str
    new_password: str

# Schema representing basic User details
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True
