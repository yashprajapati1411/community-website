from app.exceptions.common import CustomAppError

class ProfileNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Member profile not found", status_code=404)

class MobileAlreadyExistsError(CustomAppError):
    def __init__(self):
        super().__init__("Mobile number already registered to another member", status_code=400)

class FamilyMemberNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Family member not found", status_code=404)
