from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
        
    app = FastAPI(
        title="Cerevex Prediction Service Using AI Models",
        version="1.0.0"
    )

    app.include_router(router, prefix="/predict", tags=["predictor"])

    return app

app = create_app()


@app.get("/", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)