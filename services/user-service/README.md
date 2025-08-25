Cerevex User Service

Endpoints
- POST /auth/signup: create user. Optionally echoes token in X-Access-Token if DEBUG_EXPOSE_TOKEN=true.
- POST /auth/signin: sign in with email/password, returns access token in response body.
- POST /auth/signout: client-side only; discard Bearer token.
- GET /users/me: current user. Locked (requires Authorization: Bearer).
- GET /users: list users in my company, company_admin only.
- GET /users/{id}: get by id (self or same company if company_admin).
- PATCH /users/{id}: update user (same company), company_admin only.
- DELETE /users/{id}: delete user (same company), company_admin only.
- POST /company/users: company_admin creates a user in their company with roles.
- GET /company/users: company_admin lists all users in their company with roles.
- DELETE /company/users/{user_id}: company_admin removes a user from company (user becomes standalone with role "user").
- PATCH /company/users/{user_id}/roles: company_admin updates a user's roles within the company.

Security
- Only Authorization: Bearer tokens are accepted. Cookies are not used. FastAPI security is wired so docs show lock icons (HTTP Bearer only).

Env (.env in services/user-service)
- DATABASE_URL=postgresql://...
- JWT_SECRET_KEY=change-me
- ACCESS_TOKEN_TTL_MIN=1440
- ACCESS_COOKIE_NAME, COOKIE_* are ignored (legacy). 
- DEBUG_EXPOSE_TOKEN=false

Run
- pip install -r requirements.txt
- uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Notes
- Roles allowed: user, company_admin, data_analyst, product_insight_analyst. Stored as comma-separated string in users.role.
- Safety: cannot remove or demote the last company_admin of a company; company_admin cannot remove themselves.
