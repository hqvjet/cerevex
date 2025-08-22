Cerevex User Service

Endpoints
- POST /auth/signup: create user. Optionally echoes token in X-Access-Token if DEBUG_EXPOSE_TOKEN=true.
- POST /auth/signin: sign in with email/password, returns access token in response body.
- POST /auth/signout: client-side only; discard Bearer token.
- GET /users/me: current user. Locked (requires Authorization: Bearer).
- GET /users: list users, admin only. Locked.
- GET /users/{id}: get by id. Locked.
- PATCH /users/{id}: update. Admin only. Locked.
- DELETE /users/{id}: delete. Admin only. Locked.

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
- Schema strictly matches: tables users and authsessions. Roles are comma-separated in "role" field including values user, admin.
