from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from mangum import Mangum
import logging
import json

load_dotenv()

from database import Base, engine
from sqlalchemy import text
from routers import auth, users
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    async def lifespan(app: FastAPI):
        # Optional cleanup: drop legacy 'authsessions' table if it exists (stateless auth now)
        try:
            with engine.connect() as conn:
                conn.execute(text("DROP TABLE IF EXISTS authsessions"))
                conn.commit()
        except Exception:
            pass
        Base.metadata.create_all(bind=engine)
        # Ensure FK users.company_id -> companies.company_id exists (shared DB)
        try:
            with engine.connect() as conn:
                if engine.dialect.name == "postgresql":
                    exists = conn.execute(
                        text("SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_company'")
                    ).scalar()
                    if not exists:
                        conn.execute(
                            text(
                                "ALTER TABLE users ADD CONSTRAINT fk_users_company "
                                "FOREIGN KEY (company_id) REFERENCES companies(company_id)"
                            )
                        )
                        conn.commit()
        except Exception:
            # Non-fatal in dev; report in logs in a real system
            pass
        yield
        # Base.metadata.drop_all(bind=engine)
        
    app = FastAPI(
        title="Cerevex User Service",
        version="1.0.0",
        description=(
            "Auth uses httpOnly cookie '" + settings.cookie_name + "' to store access token."
            " Use the lock icon fields in docs to pass a Bearer token when testing without cookies."
        ),
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(users.router, prefix="/users", tags=["users"])

    return app

app = create_app()


@app.get("/", tags=["health"])
def health() -> dict:
    return {"status": "ok"}

# AWS Lambda handler
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)