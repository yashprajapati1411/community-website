from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_access_token
from app.repositories.repo_user import UserRepository
from app.exceptions.auth import InvalidTokenError, UserInactiveError, PermissionDeniedError
from app.models.user import User
from app.config.settings import settings

# OAuth2 standard token extraction scheme
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    """Extract and validate the access token to yield the authenticated User."""
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenError()
        
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise InvalidTokenError()
        
    user = await UserRepository.get_by_id(db, user_id_int)
    if not user:
        raise InvalidTokenError()
        
    if not user.is_active:
        raise UserInactiveError()
        
    return user

class RoleChecker:
    """Callable class dependency to validate Role-Based Access Control limits."""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise PermissionDeniedError()
        return current_user

# Reusable role check guards
get_admin_user = RoleChecker(["admin"])
get_member_user = RoleChecker(["member", "admin"])
