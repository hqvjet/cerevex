from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from mangum import Mangum
import logging, json

from config import settings
from routers import router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    async def lifespan(app: FastAPI):  # pragma: no cover - simple hook
        yield

    app = FastAPI(
        title="Cerevex Third-Party Sync Service",
        version="1.0.0",
        description="Service to synchronize external e-commerce platform data into enterprise domain.",
        lifespan=lifespan,
    )

    cors_kwargs = {
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if not settings.cors_list or "*" in settings.cors_list:
        cors_kwargs["allow_origin_regex"] = ".*"  # type: ignore[typeddict-item]
    else:
        cors_kwargs["allow_origins"] = settings.cors_list  # type: ignore[typeddict-item]
    app.add_middleware(CORSMiddleware, **cors_kwargs)

    app.include_router(router, prefix="/api")

    @app.get("/", tags=["health"])
    async def health():  # pragma: no cover - trivial
        return {"status": "ok"}

    return app


app = create_app()

mangum_handler = Mangum(app, lifespan="off")


def handler(event, context):  # pragma: no cover
    logger.info("Lambda Event:")
    logger.info(json.dumps(event))
    if "path" in event and "docs" in event["path"]:
        event["path"] = "/docs"
    if "path" in event and "redoc" in event["path"]:
        event["path"] = "/redoc"
    try:
        return mangum_handler(event, context)
    except Exception as e:  # pylint: disable=broad-except
        logger.exception("Lambda handler error")
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


if __name__ == "__main__":  # pragma: no cover
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=True)
