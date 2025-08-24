# Analysis Service

FastAPI service that interacts with the AI prediction service to analyze comment sentiment from files or direct payloads, and provide user-friendly product insights.

## Environment

Create a `.env` file in this directory:

```
AI_PREDICT_URL=http://43.207.193.11:6000/predict
SERVICE_NAME=analysis-service
LOG_LEVEL=info
``` 

## Run locally

- Install deps: see `requirements.txt`.
- Start server: `uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload`

## Endpoints

- POST `/analyze/files` — upload CSV/Excel files with columns: `content` (required), `title` (optional). Returns label stats and analysis.
- POST `/analyze/comments` — send comments directly: `{ "comments": [{"content": "...", "title": "..."?}] }`.
- POST `/insights/product` — same input as above, returns simplified consumer-friendly insights including a buy recommendation.

## File schema

- Required: `content`
- Optional: `title`

## Notes

- Excel supported via `openpyxl`.
- CSV autodetects utf-8 and fallback to utf-8-sig.
- The AI endpoint URL is configurable via `.env`.