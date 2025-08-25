from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from config import settings

http_bearer = HTTPBearer(auto_error=True)


class CurrentUser(dict):
    @property
    def email(self) -> str:
        return self.get("email")

    @property
    def role(self) -> str:
        return self.get("role")

    @property
    def company_id(self) -> str | None:
        return self.get("company_id")


ROLE_PRODUCT_INSIGHT_ANALYST = "product_insight_analyst"


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(http_bearer)) -> CurrentUser:
    token = creds.credentials
    url = f"{str(settings.user_service_url).rstrip('/')}/users/me"
    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
            r = await client.get(url, headers={"Authorization": f"Bearer {token}"})
    except httpx.RequestError as e:  # pragma: no cover
        raise HTTPException(status_code=502, detail=f"User service unreachable: {e}")
    if r.status_code == 401:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"User service error: {r.text}")
    data = r.json()
    # role string is comma-separated
    roles = [x.strip() for x in (data.get("role") or "").split(",") if x.strip()]
    if ROLE_PRODUCT_INSIGHT_ANALYST not in roles:
        raise HTTPException(status_code=403, detail="product_insight_analyst role required")
    if not data.get("company_id"):
        raise HTTPException(status_code=409, detail="User has no company")
    return CurrentUser(data)


def get_auth_header(creds: HTTPAuthorizationCredentials = Depends(http_bearer)) -> dict:
    # Use custom header to avoid upstream gateways interpreting standard Authorization differently
    return {"X-Access-Token": creds.credentials}
