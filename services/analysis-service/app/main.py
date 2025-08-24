from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from middleware.timeout import RequestTimeoutMiddleware
from dotenv import load_dotenv
from mangum import Mangum
import json
import logging

from config import get_settings
from routers.analyze import router as analyze_router
from core.ai_client import get_ai_client

load_dotenv()


def create_app() -> FastAPI:
    settings = get_settings()

    async def lifespan(app: FastAPI):
        # startup: nothing yet
        yield
        # shutdown: close AI client
        try:
            ai = get_ai_client()
            await ai.aclose()
        except Exception:
            pass

    # Configure middlewares including request timeout
    timeout_seconds = int(settings.request_timeout_sec)
    middleware = [
        Middleware(RequestTimeoutMiddleware, timeout=timeout_seconds),
    ]

    app = FastAPI(
        title="Cerevex Analysis Service",
        version="1.0.0",
        description="Service for AI-assisted sentiment analysis and product insights.",
        lifespan=lifespan,
        middleware=middleware,
    )

    # CORS configuration (aligned with user-service)
    cors_kwargs = {
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    origins = settings.cors_allow_origins
    if not origins or "*" in origins:
        cors_kwargs["allow_origin_regex"] = ".*"  # type: ignore[typeddict-item]
    else:
        cors_kwargs["allow_origins"] = origins  # type: ignore[typeddict-item]
    app.add_middleware(CORSMiddleware, **cors_kwargs)

    app.include_router(analyze_router)

    @app.get("/", tags=["health"])  # type: ignore[misc]
    def health() -> dict:
        return {"status": "ok", "service": settings.service_name}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8003)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mangum_handler = Mangum(app, lifespan="off")


def handler(event, context):
    """
    Lambda-compatible handler that wraps the FastAPI app.
    Mirrors enterprise-service handler: logs event and fixes docs/redoc paths.
    """
    logger.info("Lambda Event:")
    try:
        logger.info(json.dumps(event))
    except Exception:
        logger.info(str(event))

    # Normalize docs/redoc paths when proxying via API Gateway
    if isinstance(event, dict) and "path" in event:
        if "docs" in event["path"]:
            event["path"] = "/docs"
        if "redoc" in event["path"]:
            event["path"] = "/redoc"

    try:
        response = mangum_handler(event, context)
        logger.info(f"Response Status: {response.get('statusCode', 'Unknown')}")
        return response
    except Exception as e:
        logger.error(f"Error in Lambda handler: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error", "detail": str(e)}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        }
