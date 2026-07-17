from app.exceptions.common import CustomAppError

class NoticeNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Notice not found", status_code=404)

class EventNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Event not found", status_code=404)

class CommitteeMemberNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Committee member not found", status_code=404)

class GalleryAlbumNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Gallery album not found", status_code=404)

class GalleryImageNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Gallery image not found", status_code=404)

class SurnameHistoryNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Surname history record not found", status_code=404)

class AnnualReportNotFoundError(CustomAppError):
    def __init__(self):
        super().__init__("Annual report not found", status_code=404)

