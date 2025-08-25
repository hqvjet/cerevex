# Analysis Service

FastAPI service that interacts with the AI prediction service to analyze comment sentiment from files or direct payloads, and provide user-friendly product insights.

## Environment

Create a `.env` file in this directory (example):

```
AI_PREDICT_URL=http://43.207.193.11:6000/predict
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/cerevex_db
JWT_SECRET_KEY=change-me   # must match user-service
JWT_ALGORITHM=HS256
SERVICE_NAME=analysis-service
LOG_LEVEL=info
```

Required vars: `AI_PREDICT_URL`, `DATABASE_URL`, `JWT_SECRET_KEY`.

## Run locally

- Install deps: see `requirements.txt`.
- Start server: `uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload`

## Endpoints

- POST `/analyze/files` — (auth: `data_analyst` role) upload CSV/Excel files with columns: `content` (required), `title` (optional). Persists a summary row into `analysis_reports`.
- POST `/analyze/comments` — send comments directly: `{ "comments": [{"content": "...", "title": "..."?}] }`.
- POST `/insights/product` — same input as above, returns simplified consumer-friendly insights including a buy recommendation.

## File schema

- Required: `content`
- Optional: `title`

## Persistence

Table `analysis_reports` (auto-created):

| Column | Type | Notes |
|--------|------|-------|
| report_id | str (PK) | UUID generated | 
| user_id | str | From JWT `sub` |
| num_positive | int | aggregated |
| num_neutral | int | aggregated |
| num_negative | int | aggregated |
| short_summary | str | simple text summary |
| created_at | datetime | UTC |

`input_file_link` intentionally omitted per spec.

## Notes

- Excel supported via `openpyxl`.
- CSV autodetects utf-8 and fallback to utf-8-sig.
- The AI endpoint URL is configurable via `.env`.