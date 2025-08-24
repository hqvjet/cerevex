from __future__ import annotations

import asyncio
from typing import Callable
from starlette.types import ASGIApp, Receive, Scope, Send


class RequestTimeoutMiddleware:
    def __init__(self, app: ASGIApp, timeout: float = 600.0) -> None:
        self.app = app
        self.timeout = timeout

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def handler():
            await self.app(scope, receive, send)

        try:
            await asyncio.wait_for(handler(), timeout=self.timeout)
        except asyncio.TimeoutError:
            # Respond with 504 Gateway Timeout
            start_response = {
                "type": "http.response.start",
                "status": 504,
                "headers": [(b"content-type", b"application/json")],
            }
            body = b'{"detail": "Request timeout"}'
            await send(start_response)
            await send({"type": "http.response.body", "body": body})
