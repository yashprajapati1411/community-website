from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import Token, UserLogin, ChangePassword
from app.services.auth_service import AuthService
from app.core.security import create_access_token, decode_access_token
from app.api.deps import get_current_user, get_member_user, get_admin_user
from app.models.user import User
from app.config.settings import settings
from app.exceptions.auth import RefreshTokenInvalidError

router = APIRouter()

@router.post("/login", response_model=Token)
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
    user = await AuthService.authenticate_user(db, login_data.email, login_data.password)
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
        path=f"{settings.API_V1_STR}/v1/auth"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/refresh", response_model=Token)
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
        path=f"{settings.API_V1_STR}/v1/auth"
    )
    
    payload = decode_access_token(access_token)
    role = payload.get("role")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role
    }

@router.post("/logout")
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
        path=f"{settings.API_V1_STR}/v1/auth"
    )
    return {"status": "success", "message": "Logged out successfully"}

@router.post("/change-password")
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
@router.get("/test-member")
async def test_member_route(current_user: User = Depends(get_member_user)):
    """Test route accessible by members and administrators."""
    return {
        "message": "Access granted: Member tier verified",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

@router.get("/test-admin")
async def test_admin_route(current_user: User = Depends(get_admin_user)):
    """Test route accessible only by administrators."""
    return {
        "message": "Access granted: Admin tier verified",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }
