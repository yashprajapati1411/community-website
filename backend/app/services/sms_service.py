import logging
import httpx
from abc import ABC, abstractmethod
from typing import Optional
from app.config.settings import settings

logger = logging.getLogger(__name__)

class SMSProvider(ABC):
    @abstractmethod
    async def send_otp(self, mobile: str, otp: str) -> bool:
        """Send a 6-digit OTP to the user's mobile number."""
        pass


class MSG91SMSProvider(SMSProvider):
    """Concrete SMS provider implementation for MSG91 API."""
    def __init__(self, auth_key: Optional[str] = None, template_id: Optional[str] = None):
        self.auth_key = auth_key or getattr(settings, "MSG91_AUTH_KEY", None)
        self.template_id = template_id or getattr(settings, "MSG91_TEMPLATE_ID", None)

    async def send_otp(self, mobile: str, otp: str) -> bool:
        # Sanitize mobile to 10 digits or country code format
        clean_mobile = mobile.strip().replace("+", "").replace(" ", "")
        if len(clean_mobile) == 10:
            clean_mobile = "91" + clean_mobile

        if not self.auth_key:
            logger.info(f"MSG91_AUTH_KEY not configured. Simulated SMS delivery to {clean_mobile} [masked OTP delivery via SMS Provider].")
            return True

        url = "https://api.msg91.com/api/v5/otp"
        params = {
            "template_id": self.template_id or "",
            "mobile": clean_mobile,
            "authkey": self.auth_key,
            "otp": otp
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, params=params)
                if resp.status_code == 200:
                    return True
                logger.error(f"MSG91 SMS failed with status {resp.status_code}")
                return False
        except Exception as e:
            logger.error(f"MSG91 SMS delivery exception: {e}")
            return False


class SMSService:
    _provider: SMSProvider = MSG91SMSProvider()

    @classmethod
    def set_provider(cls, provider: SMSProvider) -> None:
        cls._provider = provider

    @classmethod
    async def send_otp(cls, mobile: str, otp: str) -> bool:
        return await cls._provider.send_otp(mobile, otp)
