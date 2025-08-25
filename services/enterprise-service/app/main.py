from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from mangum import Mangum
import json
import logging

load_dotenv()

from database import Base, engine
from routers import router
from config import settings


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    async def lifespan(app: FastAPI):
        # Create tables at startup
        Base.metadata.create_all(bind=engine)
        yield

    app = FastAPI(
        title="Cerevex Enterprise Service",
        version="1.0.0",
        description=(
            "All endpoints require authentication. Only create company is available to users with or without company_id;"
            " all others require company_id and are scoped to the caller's company."
        ),
        lifespan=lifespan,
    )

    cors_kwargs = {
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if not settings.cors_allow_origins or "*" in settings.cors_allow_origins:
        cors_kwargs["allow_origin_regex"] = ".*"  # type: ignore[typeddict-item]
    else:
        cors_kwargs["allow_origins"] = settings.cors_allow_origins  # type: ignore[typeddict-item]
    app.add_middleware(CORSMiddleware, **cors_kwargs)

    app.include_router(router, prefix="/api")
    return app


app = create_app()


@app.get("/", tags=["health"])
def health() -> dict:
    return {"status": "ok"}

mangum_handler = Mangum(app, lifespan="off")

def handler(event, context):
    """
    Custom Lambda handler for debugging and processing API Gateway events
    """
    # Log the complete event for debugging
    logger.info("Lambda Event:")
    logger.info(json.dumps(event))
    
    # Check if path contains "docs" and modify the path
    if "path" in event and "docs" in event["path"]:
        logger.info(f"Docs path detected: {event['path']} -> /docs")
        event["path"] = "/docs"
    
    # Check if path contains "redoc" and modify the path
    if "path" in event and "redoc" in event["path"]:
        logger.info(f"Redoc path detected: {event['path']} -> /redoc")
        event["path"] = "/redoc"
    
    try:
        # Process the request through Mangum
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
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8082)
