# M1 Verification Task

## Code Issues (from implementation_plan.md)
- [x] Issue 1: `setupFilesAfterSetup` → `setupFilesAfterEnv` — already fixed
- [x] Issue 2: Frontend render test `page.test.tsx` — already exists (3 tests)

## Fix docker-compose.yml warning
- [x] Remove obsolete `version: '3.8'` line

## Automated Verification
- [x] `npm run lint` → pass
- [x] `npm run typecheck` → pass
- [x] Frontend tests (3/3) → pass
- [x] Backend tests (6/6) → pass
- [x] `npm run build` → verify passed for both API and Web

## Manual Verification (M1 Done Checklist)
- [x] `docker compose up -d` → PostgreSQL healthy
- [x] `npm run migrate:up -w apps/api` → users table created
- [x] `GET /api/v1/health` → 200 + db connected
- [x] `POST /api/v1/auth/register` → 501
- [x] `POST /api/v1/auth/login` → 501
- [x] `POST /api/v1/auth/refresh` → 501
- [x] `POST /api/v1/auth/logout` → 501
- [x] `GET /api/v1/nonexistent` → 404 JSON
- [x] `X-Correlation-ID` header present
- [x] Frontend dev server → landing page on :3000
