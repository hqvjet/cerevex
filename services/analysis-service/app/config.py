from __future__ import annotations

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv
from pathlib import Path
from functools import lru_cache
from typing import List

_SERVICE_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_SERVICE_ROOT / ".env")


def _env(name: str, default: str | None = None, required: bool = False) -> str:
    val = os.getenv(name, default)
    if required and (val is None or val == ""):
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val  # type: ignore[return-value]


@dataclass
class Settings:
    # External AI inference endpoint
    ai_predict_url: str = field(default_factory=lambda: _env("AI_PREDICT_URL", required=True))
    # DB persistence (analysis_reports)
    database_url: str = field(default_factory=lambda: _env("DATABASE_URL", required=True))

    # JWT (shared secret with user-service / enterprise-service)
    jwt_secret_key: str = field(default_factory=lambda: _env("JWT_SECRET_KEY", "change-me"))
    jwt_algorithm: str = field(default_factory=lambda: _env("JWT_ALGORITHM", "HS256"))

    # Timeouts
    http_timeout_sec: float = float(_env("HTTP_TIMEOUT_SEC", "60"))  # outbound (AI)
    request_timeout_sec: float = float(_env("REQUEST_TIMEOUT_SEC", "60"))  # inbound

    # Service meta
    service_name: str = field(default_factory=lambda: _env("SERVICE_NAME", "analysis-service"))
    log_level: str = field(default_factory=lambda: _env("LOG_LEVEL", "info"))

    # CORS (comma-separated list or *)
    cors_allow_origins: List[str] = field(
        default_factory=lambda: [o.strip() for o in (_env("CORS_ALLOW_ORIGINS", "")).split(",") if o.strip()]
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
