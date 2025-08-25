from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
import httpx
from datetime import datetime
from collections import defaultdict
from config import settings
from deps import get_current_user, CurrentUser, get_auth_header
from schemas import RemoteProduct, RemoteComment, SyncResponse, SyncResultProduct

router = APIRouter()


async def fetch_remote_products(email: str) -> list[RemoteProduct]:
    url = f"{str(settings.third_party_api_url).rstrip('/')}/sellers/{email}/products"
    async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
        r = await client.get(url)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Third-party GET products failed: {r.text}")
    items = r.json() or []
    out: list[RemoteProduct] = []
    for raw in items:
        try:
            out.append(RemoteProduct(**raw))
        except Exception:  # pragma: no cover - skip malformed product
            # best-effort: continue processing others
            continue
    return out


async def fetch_remote_comments(product_id: str) -> list[RemoteComment]:
    url = f"{str(settings.third_party_api_url).rstrip('/')}/products/{product_id}/comments"
    async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
        r = await client.get(url)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Third-party GET comments failed: {r.text}")
    return [RemoteComment(**c) for c in r.json() or []]


async def fetch_company_products(company_id: str, auth_header: dict) -> list[dict]:
    url = f"{str(settings.enterprise_api_url).rstrip('/')}/companies/{company_id}/products"
    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
            # Expand custom header to standard Authorization for enterprise service
            headers = dict(auth_header)
            token = headers.get("X-Access-Token")
            if token:
                headers["Authorization"] = f"Bearer {token}"
            r = await client.get(url, headers=headers)
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Enterprise GET products network error: {e}")
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Enterprise GET products failed: {r.text}")
    return r.json() or []


async def ai_predict(comments: list[str]) -> list[str]:
    """Call AI service with same contract as analysis-service AIClient.predict.

    Request body: {"comments": [{"content": str, "title"?: str}]}
    Response: {"predicted_labels": [str, ...]}
    """
    if not comments:
        return []
    # Match analysis-service: just content list (no titles here)
    payload = {"comments": [{"content": c} for c in comments]}
    url = settings.ai_predict_url
    if url and not url.endswith('/'):
        url = url + '/'
    async with httpx.AsyncClient(timeout=settings.http_timeout_sec, follow_redirects=True) as client:
        r = await client.post(url, json=payload)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"AI predict failed: {r.text}")
    data = r.json() or {}
    labels = data.get("predicted_labels")
    if not isinstance(labels, list):
        raise HTTPException(status_code=502, detail="AI service response missing 'predicted_labels'")
    return [str(x) for x in labels]


def aggregate_labels(labels: list[str]) -> dict[str, int]:
    counts = defaultdict(int)
    for l in labels:
        norm = l.lower()
        if "pos" in norm:
            counts["num_positive"] += 1
        elif "neg" in norm:
            counts["num_negative"] += 1
        else:
            counts["num_neutral"] += 1
    return {k: counts.get(k, 0) for k in ["num_positive", "num_neutral", "num_negative"]}


async def fetch_company_admin_email(company_id: str, token: str) -> str:
    """Use dedicated lightweight endpoint to get company_admin email.

    Endpoint implemented in user-service: /users/company/admin-email
    Any authenticated user belonging to the company can call it.
    """
    url = f"{str(settings.user_service_url).rstrip('/')}/users/company/admin-email"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
            r = await client.get(url, headers=headers)
    except httpx.RequestError as e:  # pragma: no cover
        raise HTTPException(status_code=502, detail=f"User service admin-email error: {e}")
    if r.status_code == 404:
        raise HTTPException(status_code=409, detail="company_admin not found for company")
    if r.status_code == 409:
        raise HTTPException(status_code=409, detail="User has no company")
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"User service admin-email failed: {r.text}")
    data = r.json() or {}
    email = data.get("company_admin_email")
    if not email:
        raise HTTPException(status_code=409, detail="Missing company_admin_email in response")
    return email


@router.post("/sync", response_model=SyncResponse, summary="Synchronize third-party products + comments")
async def sync_products(current: CurrentUser = Depends(get_current_user), auth_header: dict = Depends(get_auth_header)):
    company_id = current.company_id
    # Extract bearer token from custom auth header
    token = auth_header.get("X-Access-Token") if auth_header else None
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")
    email = await fetch_company_admin_email(company_id, token)
    # Step 1: remote products
    remote_products = await fetch_remote_products(email)
    remote_products_map = {p.id: p for p in remote_products}
    # Step 2: remote comments
    remote_comments_map: dict[str, list[RemoteComment]] = {}
    for pid in remote_products_map.keys():  # Could parallelize if big
        remote_comments_map[pid] = await fetch_remote_comments(pid)
    # Step 3: existing enterprise products
    existing_products = await fetch_company_products(company_id, auth_header)
    existing_by_third_party: dict[str, dict] = {p["third_party_id"]: p for p in existing_products}

    results: list[SyncResultProduct] = []

    # New products
    new_product_ids = [pid for pid in remote_products_map if pid not in existing_by_third_party]
    for pid in new_product_ids:
        prod = remote_products_map[pid]
        comments = remote_comments_map.get(pid, [])
        labels = await ai_predict([c.content for c in comments]) if comments else []
        counts = aggregate_labels(labels)
        payload = {
            "product_name": prod.title,
            "third_party_id": prod.id,
            "short_summary": (prod.description or prod.title)[:280],
            "added_at": datetime.utcnow().isoformat(),
            **counts,
        }
        url = f"{str(settings.enterprise_api_url).rstrip('/')}/companies/{company_id}/products"
        try:
            async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
                headers = dict(auth_header)
                token = headers.get("X-Access-Token")
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                r = await client.post(url, json=payload, headers=headers)
            if r.status_code >= 400:
                results.append(SyncResultProduct(third_party_id=pid, action="error", reason=f"Enterprise create failed: {r.text}"))
            else:
                created = r.json()
                results.append(SyncResultProduct(third_party_id=pid, action="created", product_id=created.get("product_id"), new_counts=counts))
        except httpx.RequestError as e:  # pragma: no cover
            results.append(SyncResultProduct(third_party_id=pid, action="error", reason=f"Network: {e}"))

    # Existing products: new comments
    for third_id, existing in existing_by_third_party.items():
        prod_comments = remote_comments_map.get(third_id, [])
        if not prod_comments:
            results.append(SyncResultProduct(third_party_id=third_id, action="skipped", reason="No comments"))
            continue
        existing_sum = (existing.get("num_positive", 0) + existing.get("num_neutral", 0) + existing.get("num_negative", 0))
        if len(prod_comments) <= existing_sum:
            results.append(SyncResultProduct(third_party_id=third_id, action="skipped", reason="No new comments"))
            continue
        new_comments = prod_comments[existing_sum:]
        new_labels = await ai_predict([c.content for c in new_comments])
        new_counts = aggregate_labels(new_labels)
        if sum(new_counts.values()) == 0:
            results.append(SyncResultProduct(third_party_id=third_id, action="skipped", reason="AI produced no labels"))
            continue
        patch_counts = {
            "num_positive": existing.get("num_positive", 0) + new_counts["num_positive"],
            "num_neutral": existing.get("num_neutral", 0) + new_counts["num_neutral"],
            "num_negative": existing.get("num_negative", 0) + new_counts["num_negative"],
        }
        product_id = existing.get("product_id")
        url = f"{str(settings.enterprise_api_url).rstrip('/')}/companies/{company_id}/products/{product_id}"
        try:
            async with httpx.AsyncClient(timeout=settings.http_timeout_sec) as client:
                headers = dict(auth_header)
                token = headers.get("X-Access-Token")
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                r = await client.patch(url, json=patch_counts, headers=headers)
            if r.status_code >= 400:
                results.append(SyncResultProduct(third_party_id=third_id, action="error", reason=f"Enterprise patch failed: {r.text}", product_id=product_id))
            else:
                results.append(SyncResultProduct(third_party_id=third_id, action="updated", product_id=product_id, new_counts=patch_counts))
        except httpx.RequestError as e:  # pragma: no cover
            results.append(SyncResultProduct(third_party_id=third_id, action="error", reason=f"Network: {e}", product_id=product_id))

    summary = SyncResponse(
        company_id=company_id,
        new_products_created=sum(1 for r in results if r.action == "created"),
        updated_products=sum(1 for r in results if r.action == "updated"),
        skipped_products=sum(1 for r in results if r.action == "skipped"),
        errors=sum(1 for r in results if r.action == "error"),
        details=results,
        synced_at=datetime.utcnow(),
    )
    return summary
