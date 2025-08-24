from __future__ import annotations

import httpx
from typing import Any, Dict, List
from core.logging import get_logger
from config import get_settings

logger = get_logger(__name__)


class AIClient:
    def __init__(self, base_url: str | None = None, timeout: float | None = None, client: httpx.AsyncClient | None = None) -> None:
        settings = get_settings()
        url = base_url or settings.ai_predict_url
        # Normalize to include trailing slash to avoid 307 redirects from server
        if url and not url.endswith('/'):
            url = url + '/'
        self.base_url = url
        self.timeout = timeout or settings.http_timeout_sec
        self._client = client or httpx.AsyncClient(timeout=self.timeout, follow_redirects=True)

    async def predict(self, comments: List[Dict[str, str]]) -> List[str]:
        payload = {"comments": comments}
        logger.debug(f"Calling AI service at {self.base_url} with {len(comments)} comments")
        resp = await self._client.post(self.base_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        labels = data.get("predicted_labels")
        if not isinstance(labels, list):
            raise ValueError("AI service response missing 'predicted_labels' list")
        return [str(x) for x in labels]

    async def aclose(self) -> None:
        await self._client.aclose()


_ai_client: AIClient | None = None


def get_ai_client() -> AIClient:
    global _ai_client
    if _ai_client is None:
        _ai_client = AIClient()
    return _ai_client
