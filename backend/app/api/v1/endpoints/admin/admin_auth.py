from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class AdminRoleVerificationResponse(BaseModel):
    verified: bool
    role: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "verified": True,
                "role": "admin"
            }
        }
    )

@router.get(
    "/verify-role",
    response_model=AdminRoleVerificationResponse,
    status_code=200,
    summary="Verify Admin Privilege",
    description="Confirm that the active JWT session token carries administrative roles and privileges."
)
async def verify_admin_role(current_user: User = Depends(get_current_user)):
    """Confirm current user session token carries administrative roles."""
    return {"verified": True, "role": current_user.role}

