import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.middleware.logging")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Log request entry
        logger.info(f"Request started: {request.method} {request.url.path}")
        
        try:
            response: Response = await call_next(request)
            process_time = time.time() - start_time
            # Log request completion details
            logger.info(
                f"Request finished: {request.method} {request.url.path} - "
                f"Status: {response.status_code} - Duration: {process_time:.4f}s"
            )
            return response
        except Exception as e:
            process_time = time.time() - start_time
            # Log request failure traceback
            logger.error(
                f"Request failed: {request.method} {request.url.path} - "
                f"Exception: {str(e)} - Duration: {process_time:.4f}s",
                exc_info=True
            )
            raise e
