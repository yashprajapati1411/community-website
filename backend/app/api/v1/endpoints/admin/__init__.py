from fastapi import APIRouter, Depends
from app.api.deps import get_admin_user
from app.api.v1.endpoints.admin import (
    admin_auth,
    admin_members,
    admin_bookings,
    admin_committee,
    admin_events,
    admin_notices,
    admin_gallery,
    admin_history,
    admin_dashboard,
    admin_upload
)

admin_router = APIRouter(dependencies=[Depends(get_admin_user)])

# Include all sub-routers
admin_router.include_router(admin_auth.router, prefix="/auth", tags=["Admin Auth"])
admin_router.include_router(admin_dashboard.router, prefix="/dashboard", tags=["Admin Dashboard"])
admin_router.include_router(admin_members.router, prefix="/members", tags=["Admin Members"])
admin_router.include_router(admin_bookings.router, prefix="/bookings", tags=["Admin Bookings"])
admin_router.include_router(admin_committee.router, prefix="/committee", tags=["Admin Committee"])
admin_router.include_router(admin_events.router, prefix="/events", tags=["Admin Events"])
admin_router.include_router(admin_notices.router, prefix="/notices", tags=["Admin Notices"])
admin_router.include_router(admin_gallery.router, prefix="/gallery", tags=["Admin Gallery"])
admin_router.include_router(admin_history.router, prefix="/history", tags=["Admin Regional History"])
admin_router.include_router(admin_upload.router, prefix="/upload", tags=["Admin Uploads"])

