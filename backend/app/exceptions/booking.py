from app.exceptions.common import CustomAppError

class BookingNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Booking inquiry not found", status_code=404)
