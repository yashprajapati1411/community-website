from app.exceptions.common import CustomAppError

class InvalidCredentialsError(CustomAppError):
    def __init__(self):
        super().__init__("Invalid email or password", status_code=401)

class InvalidTokenError(CustomAppError):
    def __init__(self):
        super().__init__("Invalid or expired access token", status_code=401)

class TokenExpiredError(CustomAppError):
    def __init__(self):
        super().__init__("Token has expired", status_code=401)

class UserInactiveError(CustomAppError):
    def __init__(self):
        super().__init__("User account is inactive", status_code=403)

class PermissionDeniedError(CustomAppError):
    def __init__(self):
        super().__init__("Permission denied. Required role missing.", status_code=403)

class RefreshTokenExpiredError(CustomAppError):
    def __init__(self):
        super().__init__("Refresh token has expired or is invalid", status_code=401)

class RefreshTokenInvalidError(CustomAppError):
    def __init__(self):
        super().__init__("Invalid or revoked refresh token", status_code=401)
