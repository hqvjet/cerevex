# Enterprise Service

FastAPI service exposing authenticated CRUD for companies and products.

Access rules:
- All endpoints require authentication via JWT via Authorization: Bearer only.
- Only the create company endpoint is usable by any authenticated user (with or without company_id).
- All other endpoints require the caller to have a company_id and operate only on their own company resources.

Database schema strictly follows the provided ERD:
- `companies(company_id PK, company_name, tax_code, province, hotline, company_email, address, industry_type, registered_at DATETIME)`
- `products(product_id PK, company_id FK -> companies.company_id, product_name, third_party_id, num_positive INT DEFAULT 0, num_neutral INT DEFAULT 0, num_negative INT DEFAULT 0, short_summary, added_at DATETIME)`

## Run (dev)

Ensure environment variables are set in `.env`:
- `DATABASE_URL` (PostgreSQL recommended)
- `JWT_SECRET_KEY`, `JWT_ALGORITHM` must match user-service
- Cookie settings are ignored (legacy): `ACCESS_COOKIE_NAME`, `COOKIE_SECURE`, `COOKIE_DOMAIN`, `COOKIE_SAMESITE`

Start server:

```bash
uvicorn app.main:app --reload --port 8082
```

## API

- POST `/enterprise/companies` – create company (any authenticated user)
- GET `/enterprise/companies` – list caller's company
- GET `/enterprise/companies/{company_id}` – get company (must match caller's company_id)
- PATCH `/enterprise/companies/{company_id}` – update company (caller company only)
- DELETE `/enterprise/companies/{company_id}` – delete company (caller company only)
- POST `/enterprise/companies/{company_id}/products` – create product (caller company only)
- GET `/enterprise/companies/{company_id}/products` – list products (caller company only)
- GET `/enterprise/companies/{company_id}/products/{product_id}` – get product (caller company only)
- PATCH `/enterprise/companies/{company_id}/products/{product_id}` – update product (caller company only)
- DELETE `/enterprise/companies/{company_id}/products/{product_id}` – delete product (caller company only)
