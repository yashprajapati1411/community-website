from pydantic import BaseModel, EmailStr, ConfigDict

# Schema returned on successful authentication
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "role": "member"
            }
        }
    )

# Schema for incoming login requests
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "member@sspvmandala.com",
                "password": "StrongPassword123!"
            }
        }
    )

# Schema for changing passwords
class ChangePassword(BaseModel):
    old_password: str
    new_password: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "old_password": "OldPassword123!",
                "new_password": "NewSecurePassword456!"
            }
        }
    )

# Schema representing basic User details
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "member@sspvmandala.com",
                "role": "member",
                "is_active": True
            }
        }
    )


class StatusMessageResponse(BaseModel):
    status: str
    message: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "success",
                "message": "Operation completed successfully"
            }
        }
    )


class RBACTestResponse(BaseModel):
    message: str
    user_id: int
    email: str
    role: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Access granted: Member tier verified",
                "user_id": 1,
                "email": "member@sspvmandala.com",
                "role": "member"
            }
        }
    )



