from __future__ import annotations

from datetime import datetime
from typing import List
from pydantic import BaseModel, Field, model_validator


class RemoteProduct(BaseModel):
    id: str
    title: str
    discountPrice: float | int | None = None
    salePrice: float | int | None = None
    description: str | None = None
    colors: str | None = None
    images: str | None = None
    variants: str | None = None

    @model_validator(mode="before")
    @classmethod
    def _coerce_lists(cls, data):  # type: ignore[override]
        """Coerce list fields returned by upstream API into strings.

        Upstream sometimes returns [] or [..] instead of strings for
        description, colors, images, variants. We join lists into a
        human-readable string (comma for images; space for others).
        Empty lists become None.
        """
        if isinstance(data, dict):
            for key in ("description", "colors", "images", "variants"):
                val = data.get(key)
                if isinstance(val, list):
                    if not val:
                        data[key] = None
                    else:
                        if key == "images":
                            data[key] = ",".join(str(x) for x in val)
                        else:
                            data[key] = " ".join(str(x) for x in val)
        return data


class RemoteComment(BaseModel):
    id: str
    productId: str
    userId: str | None = None
    content: str
    createdAt: str | None = None


class SyncResultProduct(BaseModel):
    third_party_id: str
    action: str = Field(description="created|updated|skipped|error")
    reason: str | None = None
    product_id: str | None = None
    new_counts: dict | None = None


class SyncResponse(BaseModel):
    company_id: str
    new_products_created: int
    updated_products: int
    skipped_products: int
    errors: int
    details: List[SyncResultProduct]
    synced_at: datetime
