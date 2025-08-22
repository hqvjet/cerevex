import os
from dataclasses import dataclass, field
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Optional


# Load .env from the enterprise-service root
_SERVICE_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_SERVICE_ROOT / ".env")


def _env(name: str, default: str | None = None, required: bool = False) -> str:
    val = os.getenv(name, default)
    if required and (val is None or val == ""):
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val  # type: ignore[return-value]


@dataclass
class Settings:
    # Core
    database_url: str = field(default_factory=lambda: _env("DATABASE_URL", required=True))

    # Security / JWT (must match user-service to validate tokens)
    jwt_secret_key: str = field(default_factory=lambda: _env("JWT_SECRET_KEY", "change-me"))
    jwt_algorithm: str = field(default_factory=lambda: _env("JWT_ALGORITHM", "HS256"))
    cookie_name: str = field(default_factory=lambda: _env("ACCESS_COOKIE_NAME", "access_token"))
    cookie_secure: bool = _env("COOKIE_SECURE", "false").lower() == "true"
    cookie_domain: Optional[str] = _env("COOKIE_DOMAIN")
    cookie_samesite: str = field(default_factory=lambda: _env("COOKIE_SAMESITE", "lax"))

    # CORS: set CORS_ALLOW_ORIGINS to comma-separated list or "*" for any
    cors_allow_origins: List[str] = field(
        default_factory=lambda: [o.strip() for o in (_env("CORS_ALLOW_ORIGINS", "")).split(",") if o.strip()]
    )

    # Internal service URLs / timeouts
    user_service_url: str = field(default_factory=lambda: _env("USER_SERVICE_URL", "http://localhost:8000"))
    http_timeout_sec: float = float(_env("HTTP_TIMEOUT_SEC", "5"))


settings = Settings()
