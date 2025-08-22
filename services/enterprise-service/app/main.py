from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import Base, engine
from routers import router
from config import settings


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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api")
    return app


app = create_app()


@app.get("/", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8082, reload=True)
