# Milestone 7: Production Ready — Implementation Plan

> **Project:** Gig Job Marketplace Web Platform
> **Milestone:** M7 – Production Ready
> **Date:** 2026-03-26
> **Goal:** Đưa hệ thống từ "feature complete" sang "production-grade" — tập trung vào bảo mật, testing, hiệu năng, observability, backup, CI/CD.

---

## Current State Analysis (Gap Analysis)

### What Exists
| Component | Status | Chi tiết |
|---|---|---|
| Error handling | ✅ Good | `errorHandler.ts` — sanitize stack trace in production, AppError/DomainError classification |
| Zod validation | ✅ Good | 6 validator files cho auth, job, review, user, worker, gamification |
| Rate limiting | ⚠️ Partial | Chỉ có `loginLimiter` (5/min), `registerLimiter` (3/min), `generalLimiter` (100/min) |
| CORS | ⚠️ Partial | Dùng `config.CORS_ORIGIN` nhưng thiếu `methods`, `allowedHeaders`, `maxAge` |
| DB Pool | ⚠️ Partial | `max: 20`, `idle: 30s`, `connect: 5s` — thiếu `statement_timeout` |
| Logging | ✅ Good | Winston + correlation ID + request logger |
| Sentry | ✅ Good | Init in `server.ts`, capture in error handler |
| Health check | ⚠️ Basic | `/health` chỉ check DB connectivity, không có deep check |
| Existing tests | ⚠️ Minimal | 3 files: `api.test.ts` (7 tests), `Job.test.ts` (7 tests), `page.test.tsx` (3 tests) |
| CI Pipeline | ⚠️ Basic | lint + typecheck + test + build — thiếu security audit, coverage |

### What's Missing
| Component | Status |
|---|---|
| Helmet (security headers) | ❌ Not installed |
| ILIKE search input sanitization | ❌ Missing |
| `express.json({ limit })` | ❌ Not configured |
| Additional rate limiters (job, review, search, gamification, refresh) | ❌ Missing |
| Cookie flags review (httpOnly, secure, sameSite) | ❓ Needs audit |
| node-cache (in-memory caching) | ❌ Not installed |
| prom-client (application metrics) | ❌ Not installed |
| Deep health check (`/health/deep`) | ❌ Missing |
| Backup/Restore scripts | ❌ Missing |
| Backend unit tests (domain/application layers) | ❌ Only 1 domain test file |
| Backend integration tests (all API endpoints) | ❌ Missing |
| CI security audit job | ❌ Missing |
| CI coverage reports | ❌ Missing |
| Load test scripts | ❌ Missing |
| DB statement_timeout | ❌ Missing |
| Response payload optimization (listing preview) | ❌ Missing |

---

## Proposed Changes

> [!IMPORTANT]
> M7 không thêm feature mới. Chỉ hardening — mọi existing features PHẢI vẫn work sau khi hoàn thành.

Chia thành **7 Task Groups**, thực hiện tuần tự:

---

### Task 1: Security Hardening

#### [NEW] [sanitizeSearch.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/shared/utils/sanitizeSearch.ts)
- Utility `sanitizeSearchInput(keyword)` — escape `%`, `_`, `\` cho ILIKE queries

#### [MODIFY] [app.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/app.ts)
- Add `express.json({ limit: '1mb' })`
- Add `helmet()` middleware (install package `helmet`)
- Enhance CORS config: add `methods`, `allowedHeaders`, `maxAge`

#### [MODIFY] [rateLimiter.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/interface/http/middlewares/rateLimiter.ts)
- Update existing limiters to match M7 spec (login: 10/15min, register: 10/15min)
- Add: `refreshLimiter`, `jobCreationLimiter`, `reviewCreationLimiter`, `searchLimiter`, `gamificationLimiter`

#### [MODIFY] Route files — Apply new rate limiters
- `auth.routes.ts`: refreshLimiter
- `job.routes.ts`: jobCreationLimiter, searchLimiter
- `review.routes.ts`: reviewCreationLimiter
- `gamification.routes.ts`: gamificationLimiter
- `worker.routes.ts`, `category.routes.ts`, `skill.routes.ts`: searchLimiter

#### [MODIFY] [connection.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/infrastructure/database/connection.ts)
- Add `statement_timeout: 10000` (10s query timeout)
- Add `min: 5` idle connections

#### SQL Repositories — Audit parameterized queries
- Review all 9 PostgresXxxRepository files for SQL injection
- Apply `sanitizeSearchInput()` where ILIKE is used (JobRepository, WorkerProfileRepository)

---

### Task 2: Observability Enhancement

#### [MODIFY] [health.routes.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/interface/http/routes/health.routes.ts)
- Add `GET /health/deep` — checks DB connectivity + response time + pool stats + version

#### [NEW] [metrics.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/infrastructure/metrics/index.ts)
- Application metrics via logging (request duration histogram, error counters, DB pool gauges)
- Lightweight approach: log-based metrics (không cần prom-client cho MVP)

#### [MODIFY] [requestLogger.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/interface/http/middlewares/requestLogger.ts)
- Add response time tracking, log `duration_ms` cho mỗi request

---

### Task 3: Performance Tuning

#### [NEW] [cache.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/infrastructure/cache/index.ts)
- Install `node-cache`, create cache service
- TTL configs: categories (5min), skills (10min), achievements (30min), trending (2min)

#### [MODIFY] Repositories/Use cases — Integrate cache
- `PostgresCategoryRepository.findAllWithJobCount()`: cache 5 min
- `PostgresSkillRepository.findAll()`: cache 10 min
- `PostgresAchievementRepository.findAllDefinitions()`: cache 30 min

#### [MODIFY] [connection.ts](file:///c:/Coding/GodsAgentPatchv0/apps/api/src/infrastructure/database/connection.ts)
- Already covered in Task 1 (statement_timeout, min connections)

#### SQL Migration — Add missing indexes
- Create migration for performance indexes nếu thiếu (check sau khi audit)

---

### Task 4: Backend Unit Tests

#### [NEW] Domain layer tests
- `Review.test.ts` — validateCanReview, rating range
- `WorkerProfile.test.ts` — visibility rules
- `PointTransaction.test.ts` — points positive, action codes
- `User.test.ts` — role validation, password rules

#### [NEW] Application layer tests (mocked repos)
- `RegisterUseCase.test.ts`, `LoginUseCase.test.ts`
- `RefreshTokenUseCase.test.ts` (rotation, reuse detection)
- `CreateJobUseCase.test.ts`, `PublishJobUseCase.test.ts`
- `CreateReviewUseCase.test.ts`
- `GamificationService.test.ts` (points, cooldown, cap, achievements)

---

### Task 5: Backend Integration Tests

#### [NEW] Integration test files (Jest + Supertest)
- `auth.integration.test.ts` — register, login, refresh, logout
- `jobs.integration.test.ts` — CRUD, publish, close, search
- `workers.integration.test.ts` — profile, listing
- `reviews.integration.test.ts` — create, list
- `gamification.integration.test.ts` — points, leaderboard

> [!WARNING]
> Integration tests sẽ cần running PostgreSQL. Trong CI dùng service container, local dùng Docker.

---

### Task 6: Backup & CI/CD Hardening

#### [NEW] [backup-db.sh](file:///c:/Coding/GodsAgentPatchv0/scripts/backup-db.sh)
- `pg_dump` with custom format, compression, 7-day retention

#### [NEW] [restore-db.sh](file:///c:/Coding/GodsAgentPatchv0/scripts/restore-db.sh)
- Restore procedure with safety confirmation

#### [MODIFY] [ci.yml](file:///c:/Coding/GodsAgentPatchv0/.github/workflows/ci.yml)
- Add `security-audit` job (`npm audit --audit-level=high`)
- Add `--coverage` to test commands
- Upload coverage artifacts
- Add `develop` branch trigger
- Separate `test-backend` and `test-frontend` jobs

---

### Task 7: Documentation & Cleanup

#### [MODIFY] [README.md](file:///c:/Coding/GodsAgentPatchv0/README.md)
- Update with security, testing, backup commands

#### [MODIFY] [.env.example](file:///c:/Coding/GodsAgentPatchv0/.env.example)
- Ensure all env vars documented, no real values

---

## Implementation Priority & Execution Order

1. **Task 1: Security Hardening** — Install helmet, sanitize inputs, rate limiters, CORS, DB timeout
2. **Task 2: Observability** — Deep health check, metrics logging, request duration
3. **Task 3: Performance** — node-cache, response optimization 
4. **Task 4: Domain/Application Unit Tests** — Core business logic coverage
5. **Task 5: Integration Tests** — All API endpoint coverage
6. **Task 6: Backup & CI/CD** — Scripts, pipeline hardening
7. **Task 7: Documentation** — README, .env.example update

---

## Verification Plan

### Automated Tests

```bash
# 1. Run existing tests to ensure no regression
npm test

# 2. Lint & typecheck  
npm run lint
npm run typecheck

# 3. Run backend tests with coverage
npm run test -w apps/api -- --coverage

# 4. Build check
npm run build
```

### Manual Verification

1. **Security Headers**: Start server (`npm run dev:api`), call `GET /api/v1/health` → verify response headers include `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`
2. **Rate Limiting**: Send 11 rapid login requests → verify 429 on 11th request
3. **Deep Health Check**: Call `GET /api/v1/health/deep` → verify DB status, response time, version info
4. **CORS**: Call API from different origin → verify blocked
5. **Body Size Limit**: Send >1MB JSON body → verify 413 error
6. **Cache**: Call categories twice rapidly → verify 2nd call is faster (cache hit)
7. **Backup**: Run `scripts/backup-db.sh` → verify dump file created

### CI Pipeline
- Push to a branch, verify GitHub Actions runs: lint → typecheck → security audit → test (with coverage) → build

---

## Out of Scope (Confirmed)
- ❌ Redis — dùng node-cache in-memory
- ❌ CDN / WAF / DDOS protection
- ❌ Production deployment
- ❌ Monitoring dashboard
- ❌ E2E Playwright tests (scope quá lớn, để phase riêng)
- ❌ Load tests with k6/Artillery (cần seed data + infra riêng)
- ❌ Frontend component tests (scope riêng)
