from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import Field
from pydantic import field_validator
from pathlib import Path
from functools import lru_cache
from typing import List


_SERVICE_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    # Required: must be provided via environment (.env)
    ai_predict_url: str = Field(..., description="AI service predict endpoint URL")

    # Keep safe defaults in code (non-sensitive)
    service_name: str = "analysis-service"
    log_level: str = "info"
    # Outbound HTTP timeout (AI service)
    http_timeout_sec: float = 60.0
    # Inbound request timeout (per API request)
    request_timeout_sec: float = 60.0
    # CORS: set CORS_ALLOW_ORIGINS to comma-separated list or include "*" for any
    cors_allow_origins: List[str] = Field(default_factory=list)

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return [str(o).strip() for o in v if str(o).strip()]
        s = str(v)
        return [o.strip() for o in s.split(",") if o.strip()]

    class Config:
        env_file = str(_SERVICE_ROOT / ".env")
        env_prefix = ""
        case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
