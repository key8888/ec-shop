import time
from fastapi import Request, HTTPException


class RateLimiter:
    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = {}

    def _cleanup(self):
        now = time.time()
        for ip in list(self.requests.keys()):
            self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window_seconds]
            if not self.requests[ip]:
                del self.requests[ip]

    async def check(self, request: Request):
        self._cleanup()
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        if ip not in self.requests:
            self.requests[ip] = []
        self.requests[ip].append(now)
        if len(self.requests[ip]) > self.max_requests:
            raise HTTPException(status_code=429, detail="Too many requests")


rate_limiter = RateLimiter()
