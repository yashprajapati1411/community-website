from fastapi import APIRouter, Depends, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    Token, UserLogin, ChangePassword, StatusMessageResponse, RBACTestResponse,
    RegistrationRequestCreate, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
)
from app.schemas.admin import RegistrationRequestResponse
from app.services.auth_service import AuthService
from app.services.registration_service import RegistrationService
from app.core.security import create_access_token, decode_access_token
from app.api.deps import get_current_user, get_member_user, get_admin_user
from app.models.user import User
from app.config.settings import settings
from app.exceptions.auth import RefreshTokenInvalidError

router = APIRouter()

@router.post(
    "/login",
    response_model=Token,
    status_code=200,
    summary="User Login",
    description="Authenticate user with email and password, issuing a JWT access token and an HttpOnly refresh cookie."
)
async def login(
    response: Response,
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Log in a user and issue tokens.

    **Note for future implementation: Login Rate Limiting**
    - To protect against brute-force attacks, we should intercept login attempts.
    - Implement a Redis-backed rate limiter (e.g., tracking attempts by user email and request IP address).
    - Limit attempts to a maximum of 5 failures in 15 minutes. Excess attempts should trigger a 429 Too Many Requests response with a cooldown timer.
    """
    user = await AuthService.authenticate_user(db, login_data.mobile, login_data.password)
    access_token = create_access_token(subject=user.id, role=user.role)
    plain_refresh_token = await AuthService.create_user_refresh_token(db, user.id)
    
    # Store refresh token in HttpOnly cookie restricted to auth paths
    response.set_cookie(
        key="refresh_token",
        value=plain_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path=f"{settings.API_V1_STR}/auth"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post(
    "/token",
    response_model=Token,
    status_code=200,
    summary="OAuth2 Access Token (Swagger UI Authorization)",
    description="Dedicated OAuth2 password flow endpoint accepting username (email) and password via form-data (application/x-www-form-urlencoded) for Swagger UI Authorize button integration.",
    include_in_schema=True
)
async def login_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """OAuth2 compatible token login, required for Swagger UI authorization."""
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    access_token = create_access_token(subject=user.id, role=user.role)
    plain_refresh_token = await AuthService.create_user_refresh_token(db, user.id)
    
    # Store refresh token in HttpOnly cookie restricted to auth paths
    response.set_cookie(
        key="refresh_token",
        value=plain_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path=f"{settings.API_V1_STR}/auth"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post(
    "/refresh",
    response_model=Token,
    status_code=200,
    summary="Refresh Access Token",
    description="Exchange a valid refresh token cookie for a new JWT access token and a rotated refresh token cookie."
)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Exchange a valid refresh token cookie for a new access token and rotated refresh token."""
    plain_refresh_token = request.cookies.get("refresh_token")
    if not plain_refresh_token:
        raise RefreshTokenInvalidError()
        
    access_token, new_plain_refresh_token = await AuthService.refresh_access_token(
        db, plain_refresh_token
    )
    
    # Set the updated rotated refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=new_plain_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path=f"{settings.API_V1_STR}/auth"
    )
    
    payload = decode_access_token(access_token)
    role = payload.get("role")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role
    }

@router.post(
    "/logout",
    response_model=StatusMessageResponse,
    status_code=200,
    summary="User Logout",
    description="Log out a user by revoking their refresh token session in the database and clearing the browser cookie."
)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Log out a user by revoking their refresh token session and clearing the browser cookie."""
    plain_refresh_token = request.cookies.get("refresh_token")
    if plain_refresh_token:
        await AuthService.logout_user(db, plain_refresh_token)
        
    response.delete_cookie(
        key="refresh_token",
        path=f"{settings.API_V1_STR}/auth"
    )
    return {"status": "success", "message": "Logged out successfully"}

@router.post(
    "/change-password",
    response_model=StatusMessageResponse,
    status_code=200,
    summary="Change User Password",
    description="Update the password for the currently authenticated user."
)
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update password for the logged-in user."""
    await AuthService.change_user_password(
        db, current_user.id, data.old_password, data.new_password
    )
    return {"status": "success", "message": "Password updated successfully"}

# --- RBAC Test Routes ---
@router.get(
    "/test-member",
    response_model=RBACTestResponse,
    status_code=200,
    summary="Test Member Route Access",
    description="Test endpoint accessible by verified members and administrators to verify RBAC permissions."
)
async def test_member_route(current_user: User = Depends(get_member_user)):
    """Test route accessible by members and administrators."""
    return {
        "message": "Access granted: Member tier verified",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

@router.get(
    "/test-admin",
    response_model=RBACTestResponse,
    status_code=200,
    summary="Test Admin Route Access",
    description="Test endpoint accessible exclusively by administrators to verify admin RBAC permissions."
)
async def test_admin_route(current_user: User = Depends(get_admin_user)):
    """Test route accessible only by administrators."""
    return {
        "message": "Access granted: Admin tier verified",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

@router.post(
    "/register",
    response_model=RegistrationRequestResponse,
    status_code=201,
    summary="Submit Member Registration Request",
    description="Submit a registration request for community membership verification."
)
async def register(
    data: RegistrationRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new member request."""
    return await RegistrationService.create_request(db, data)


@router.post(
    "/forgot-password/request-otp",
    status_code=200,
    summary="Request Password Reset OTP",
    description="Generate and send a 6-digit OTP to registered mobile number via SMS provider."
)
async def request_password_reset_otp(
    request_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request password reset OTP."""
    return await AuthService.request_password_reset_otp(db, request_data.mobile)


@router.post(
    "/forgot-password/verify-otp",
    status_code=200,
    summary="Verify Password Reset OTP",
    description="Verify 6-digit OTP and receive a temporary single-use reset token."
)
async def verify_password_reset_otp(
    verify_data: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify OTP for password reset."""
    return await AuthService.verify_password_reset_otp(db, verify_data.mobile, verify_data.otp)


@router.post(
    "/forgot-password/reset-password",
    status_code=200,
    summary="Reset Password",
    description="Reset user password using valid single-use reset token."
)
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Complete password reset flow."""
    return await AuthService.reset_password_with_token(
        db,
        reset_data.mobile,
        reset_data.reset_token,
        reset_data.new_password,
        reset_data.confirm_password
    )

