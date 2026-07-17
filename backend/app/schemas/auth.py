from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional

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
    mobile: str
    password: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "mobile": "9876543210",
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
    email: str
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


class RegistrationRequestCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    mobile: str = Field(..., min_length=10, max_length=20)
    password: Optional[str] = Field("Welcome@123", min_length=6, max_length=128)
    confirm_password: Optional[str] = Field(None, max_length=128)
    email: Optional[str] = Field(None, max_length=255)
    village: Optional[str] = Field("Ahmedabad", max_length=255)
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Ramesh Bhai Patel",
                "mobile": "9876543210",
                "password": "StrongPassword123!",
                "confirm_password": "StrongPassword123!",
                "email": "ramesh@example.com",
                "village": "Ahmedabad"
            }
        }
    )


class ForgotPasswordRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=20)


class VerifyOTPRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=20)
    otp: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=20)
    reset_token: str = Field(..., min_length=10, max_length=255)
    new_password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)

