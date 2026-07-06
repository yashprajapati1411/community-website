from fastapi import APIRouter
from app.api.v1.endpoints.public import (
    committee,
    gallery,
    events,
    notices,
    history,
    booking
)

public_router = APIRouter()

public_router.include_router(committee.router, prefix="/committee", tags=["Public APIs"])
public_router.include_router(gallery.router, prefix="/gallery", tags=["Public APIs"])
public_router.include_router(events.router, prefix="/events", tags=["Public APIs"])
public_router.include_router(notices.router, prefix="/notices", tags=["Public APIs"])
public_router.include_router(history.router, prefix="/history", tags=["Public APIs"])
public_router.include_router(booking.router, prefix="/bookings", tags=["Public APIs"])

