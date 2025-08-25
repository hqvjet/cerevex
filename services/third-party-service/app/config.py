from __future__ import annotations

from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, model_validator


class Settings(BaseSettings):
    """Runtime configuration.

    Intentionally make URLs optional first so we can aggregate a helpful
    error listing ALL missing variables instead of failing on the first.
    """

    environment: str = Field(default="dev")
    third_party_api_url: Optional[str] = Field(default=None, alias="THIRD_PARTY_API_URL")
    enterprise_api_url: Optional[str] = Field(default=None, alias="ENTERPRISE_API_URL")
    ai_predict_url: Optional[str] = Field(default=None, alias="AI_PREDICT_URL")
    user_service_url: Optional[str] = Field(default=None, alias="USER_SERVICE_URL")
    http_timeout_sec: int = Field(default=15, alias="HTTP_TIMEOUT_SEC")
    cors_allow_origins: str | None = Field(default="*", alias="CORS_ALLOW_ORIGINS")

    class Config:
        case_sensitive = False
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_list(self) -> List[str] | None:
        if not self.cors_allow_origins:
            return None
        if self.cors_allow_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def _ensure_required(self):  # type: ignore[override]
        missing = [
            name for name in [
                "THIRD_PARTY_API_URL" if not self.third_party_api_url else None,
                "ENTERPRISE_API_URL" if not self.enterprise_api_url else None,
                "AI_PREDICT_URL" if not self.ai_predict_url else None,
                "USER_SERVICE_URL" if not self.user_service_url else None,
            ] if name is not None
        ]
        if missing:
            # Raise a single clear message listing all missing keys.
            raise ValueError(
                "Missing required environment variables: " + ", ".join(missing) +
                "\nCreate a .env file or export them before running the service."
            )
        return self


@lru_cache
def get_settings() -> Settings:  # pragma: no cover - trivial accessor
    return Settings()  # type: ignore[arg-type]


settings = get_settings()
