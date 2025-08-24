from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path
from functools import lru_cache


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
    # Comma-separated list or "*". Example: "http://localhost:3000,https://app.example.com"
    cors_allow_origins: str = "*"

    class Config:
        env_file = str(_SERVICE_ROOT / ".env")
        env_prefix = ""
        case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
