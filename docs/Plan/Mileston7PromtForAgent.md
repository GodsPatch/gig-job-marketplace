# Implementation Prompt — Milestone 7: Production Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M7 – Production Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M7

---

Bạn là Senior Full-Stack / DevOps Engineer. Nhiệm vụ: triển khai **Milestone 7 (Production Ready)** cho dự án "Gig Job Marketplace" — đưa hệ thống từ "feature complete" sang "production-grade".

**Lưu ý:** M7 KHÔNG thêm feature mới. Tập trung hoàn toàn vào chất lượng, bảo mật, hiệu năng, observability, và khả năng vận hành.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — đã feature complete qua M1→M6.

### Milestone roadmap
- M1 – Foundation Ready ✅
- M2 – User System Ready ✅
- M3 – Job Core Ready ✅
- M4 – Discovery Ready ✅
- M5 – Marketplace Ready ✅
- M6 – Gamification Ready ✅
- **M7 – Production Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M8 – Launch

### Tech stack đã có
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express.js, TypeScript, Clean Architecture 4 layers
- **Database**: PostgreSQL 16 (pg driver, KHÔNG ORM), Docker Compose
- **Infra**: npm workspaces monorepo, node-pg-migrate, GitHub Actions CI
- **Existing tools**: Winston logging, Sentry error tracking, Zod validation, Helmet, express-rate-limit

### Features đã có (M1→M6)
- Auth system (register, login, refresh rotation, logout, roles: worker/employer/admin)
- User profile management
- Job lifecycle (draft → published → closed), categories
- Job discovery (search, filter, sort, pagination, trending)
- Worker profiles, skills system, worker listing/search
- Public profiles (worker + employer)
- Review/rating system (1-5 sao, gắn job closed)
- Gamification (points, achievements, leaderboard, progress page)

### Database tables (16 tables total)
users, refresh_tokens, categories, jobs, skills, worker_profiles, worker_skills, reviews, point_transactions, user_points_summary, achievement_definitions, user_achievements, leaderboard_snapshots

### API endpoints (~30 endpoints)
Auth (4), Users (2), Categories (2), Jobs (7), Workers (4), Skills (1), Reviews (3), Public Profile (1), Gamification (4)

---

## 2. MỤC TIÊU MILESTONE M7

| Hạng mục | Mục tiêu |
|---|---|
| **Security** | Audit + hardening — 0 lỗ hổng critical/high |
| **Testing** | Regression suite — >80% coverage core logic, integration test tất cả API |
| **Performance** | Tuning — p95 < 500ms listing, p95 < 200ms detail, 0 slow query > 1s |
| **Observability** | Logging + metrics + health check — đủ để vận hành production |
| **Backup** | Database backup automated daily + restore procedure tested |
| **CI/CD** | Pipeline hardened — full test + security scan trước merge |

---

## 3. SECURITY HARDENING

### 3.1 Input Validation & Sanitization Audit

**Checklist rà soát:**
```
- [ ] Tất cả API endpoints đã có Zod validation middleware
- [ ] Không có endpoint nào nhận raw user input vào SQL query
- [ ] Parameterized queries ($1, $2) dùng cho TẤT CẢ SQL queries
- [ ] ILIKE keyword search: escape %, _, \ trong user input
- [ ] HTML entities sanitized trong text output (XSS prevention)
- [ ] Request body size limited (express.json({ limit: '1mb' }))
- [ ] File upload: KHÔNG có ở app hiện tại (confirm)
- [ ] Query params validated (type, range, enum values)
- [ ] UUID params validated format trước khi query DB
```

**Action items:**
1. Tạo utility `sanitizeSearchInput(keyword)` — escape ILIKE special characters
2. Add `express.json({ limit: '1mb' })` nếu chưa có
3. Review tất cả SQL trong repository files — đảm bảo 100% parameterized
4. Add input length limits cho tất cả string fields chưa có

### 3.2 HTTP Security Headers

**Cấu hình Helmet (đã có từ M1, cần review + tăng cường):**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Tailwind cần unsafe-inline
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,  // Cho phép load external images
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

**Kiểm tra response headers:**
```
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 0 (deprecated, CSP thay thế)
- [ ] Strict-Transport-Security: max-age=31536000
- [ ] Content-Security-Policy: configured
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Cache-Control: phù hợp cho từng route
```

### 3.3 CORS Configuration

```typescript
app.use(cors({
  origin: [process.env.FRONTEND_URL],  // Chỉ frontend URL, KHÔNG '*'
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Cho httpOnly cookies
  maxAge: 86400,  // Preflight cache 24h
}));
```

### 3.4 Rate Limiting Review

| Route Group | Rate Limit | Window |
|---|---|---|
| Auth endpoints (login, register) | 10 req | 15 min |
| Refresh token | 20 req | 15 min |
| Job creation | 20 req | 1 hour |
| Review creation | 10 req | 1 hour |
| Public listing/search | 60 req | 1 min |
| Gamification | 30 req | 1 min |
| All other endpoints | 100 req | 1 min |

### 3.5 Authentication Hardening

```
- [ ] JWT secret key đủ mạnh (≥ 256 bit)
- [ ] Access token expiry ngắn (15m) — confirm
- [ ] Refresh token rotation hoạt động — reuse detection
- [ ] Expired refresh tokens cleaned up (scheduled job hoặc ON DELETE)
- [ ] Password hashing: bcrypt, cost factor ≥ 12
- [ ] Timing-safe comparison cho tokens
- [ ] No sensitive data in JWT payload (chỉ userId, role)
- [ ] Logout revoke ALL refresh tokens hoặc specific token
- [ ] Cookie flags: httpOnly=true, secure=true, sameSite='strict'
```

### 3.6 Dependency Vulnerability Audit

```bash
# Chạy audit
npm audit --workspace=apps/api
npm audit --workspace=apps/web
npm audit --workspace=packages/shared

# Target: 0 critical, 0 high
# Fix: npm audit fix hoặc manual update
```

**Thêm vào CI pipeline:**
```yaml
- name: Security Audit
  run: npm audit --audit-level=high
```

### 3.7 Error Message Review

```
- [ ] Production mode: KHÔNG trả stack trace trong API response
- [ ] KHÔNG trả database error details cho client (column names, query text)
- [ ] Login failure: "Email hoặc mật khẩu không đúng" (KHÔNG phân biệt email tồn tại)
- [ ] 404 cho resource not found (KHÔNG 403 để tránh leak existence) — đã có từ M3
- [ ] Sentry captures full error + context nhưng client nhận sanitized message
```

### 3.8 Secrets Management

```
- [ ] KHÔNG có secrets hardcoded trong code
- [ ] .env.example KHÔNG chứa real values
- [ ] .env trong .gitignore
- [ ] Production sẽ dùng environment variables (không file)
- [ ] JWT_SECRET, DATABASE_URL, SENTRY_DSN, etc. documented
```

---

## 4. TEST REGRESSION SUITE

### 4.1 Coverage Targets

| Category | Target | Scope |
|---|---|---|
| **Domain layer** | >90% | Entities, value objects, domain logic |
| **Application layer** | >85% | Use cases, business logic |
| **Infrastructure layer** | >75% | Repository queries, services |
| **Interface layer** | >70% | Controllers, validators |
| **Overall backend** | >80% | All backend code |
| **Frontend components** | >60% | Key components |

### 4.2 Backend Unit Tests

**Domain layer tests (Jest):**
```
tests/domain/
├── entities/
│   ├── Job.test.ts           # State transitions, validation, isPublishable()
│   ├── Review.test.ts        # validateCanReview(), rating range
│   ├── WorkerProfile.test.ts # Visibility rules
│   └── PointTransaction.test.ts # Points positive, action codes
├── value-objects/
│   ├── JobStatus.test.ts     # canTransition()
│   ├── Rating.test.ts        # 1-5 range
│   └── AchievementTier.test.ts
└── ...
```

**Application layer tests (Jest + mocked repos):**
```
tests/application/
├── auth/
│   ├── RegisterUseCase.test.ts
│   ├── LoginUseCase.test.ts
│   ├── RefreshTokenUseCase.test.ts (rotation, reuse detection)
│   └── LogoutUseCase.test.ts
├── job/
│   ├── CreateJobUseCase.test.ts
│   ├── PublishJobUseCase.test.ts (validation, state transition)
│   ├── CloseJobUseCase.test.ts
│   └── SearchPublicJobsUseCase.test.ts
├── review/
│   ├── CreateReviewUseCase.test.ts (closed job, no self, no duplicate)
│   └── ListUserReviewsUseCase.test.ts
├── gamification/
│   ├── GamificationService.test.ts (points, cooldown, cap, achievements)
│   └── GetLeaderboardUseCase.test.ts
└── ...
```

### 4.3 Backend Integration Tests (Jest + Supertest)

Tất cả API endpoints phải có integration test:

```
tests/integration/
├── auth.integration.test.ts
│   - POST /register → 201
│   - POST /register duplicate → 409
│   - POST /login → 200 + tokens
│   - POST /login wrong password → 401
│   - POST /refresh → 200 + new tokens
│   - POST /logout → 200 + token revoked
├── jobs.integration.test.ts
│   - POST /jobs → 201 (draft)
│   - GET /jobs/me → 200 (owner's jobs)
│   - PATCH /jobs/:id → 200 (edit draft)
│   - POST /jobs/:id/publish → 200
│   - POST /jobs/:id/close → 200
│   - GET /jobs/:slug → 200
│   - GET /jobs/public → 200 (filtered, paginated)
├── workers.integration.test.ts
├── reviews.integration.test.ts
├── gamification.integration.test.ts
└── ...
```

**Test database:** Dùng separate test database (PostgreSQL in Docker, reset per test suite).

### 4.4 E2E Test — Critical Flows

Dùng **Playwright** hoặc **Cypress** cho E2E:

**Critical flows cần E2E:**
1. **Register → Login → View Dashboard** (happy path auth)
2. **Create Job → Edit → Publish → View Public** (job lifecycle)
3. **Search Jobs → Filter → Paginate → View Detail** (discovery)
4. **Worker Profile → Update Skills → View Public Profile** (marketplace)
5. **Close Job → Write Review → View on Profile** (review flow)
6. **Earn Points → View Progress → Check Leaderboard** (gamification)

### 4.5 Auth Edge Case Tests

```
- [ ] Expired access token → 401
- [ ] Expired refresh token → 401 + require re-login
- [ ] Revoked refresh token → 401
- [ ] Concurrent refresh (race condition) → one succeeds, one fails
- [ ] Reuse detection → revoke all tokens of user
- [ ] Role escalation attempt → 403
- [ ] Access others' resources → 404 (not 403)
```

### 4.6 Load Test (k6 hoặc Artillery)

```javascript
// k6 script cho critical endpoints
export default function() {
  // GET /api/v1/jobs/public → target: p95 < 500ms, errors < 1%
  // GET /api/v1/jobs/:slug → target: p95 < 200ms
  // GET /api/v1/workers → target: p95 < 500ms
  // GET /api/v1/gamification/leaderboard → target: p95 < 500ms
  // POST /api/v1/auth/login → target: p95 < 300ms
}
// Scenarios: 50 concurrent users, 5 min duration
```

---

## 5. PERFORMANCE TUNING

### 5.1 Database Query Audit

**Critical queries cần EXPLAIN ANALYZE:**

| Query | Location | Target |
|---|---|---|
| Public job search (multi-filter) | `PostgresJobRepository.findPublished()` | < 50ms |
| Trending jobs (score calculation) | Trending score query | < 50ms |
| Worker listing (skills join) | `PostgresWorkerProfileRepository.findVisible()` | < 50ms |
| Leaderboard (aggregate points) | `PostgresPointRepository.getLeaderboard()` | < 100ms |
| Category with job count | `PostgresCategoryRepository.findAllWithJobCount()` | < 30ms |
| User public profile (joins) | Multiple joins for profile | < 50ms |

**Action items:**
1. Chạy `EXPLAIN ANALYZE` cho mỗi critical query
2. Identify missing indexes
3. Fix N+1 queries (đặc biệt worker skills, reviews)
4. Optimize sort queries (trending score)

### 5.2 Missing Indexes Review

```sql
-- Kiểm tra index usage
SELECT schemaname, relname, idx_scan, seq_scan
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Kiểm tra unused indexes
SELECT indexrelid::regclass as index_name, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### 5.3 Caching Strategy

**Dùng in-memory cache (node-cache) cho MVP — KHÔNG Redis ở M7:**

| Data | TTL | Invalidation |
|---|---|---|
| Categories list | 5 min | POST/PATCH category (admin) |
| Skills list | 10 min | Rất ít thay đổi |
| Achievement definitions | 30 min | Seed only |
| Trending jobs (top 8) | 2 min | Automatic expiry |

**Implementation:**
```typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 });

// Trong use case hoặc repository
async getCategories(): Promise<Category[]> {
  const cached = cache.get<Category[]>('categories');
  if (cached) return cached;
  const categories = await this.repo.findAllWithJobCount();
  cache.set('categories', categories);
  return categories;
}
```

### 5.4 Connection Pool Optimization

```typescript
// pg pool config
const pool = new Pool({
  max: 20,            // Max connections
  min: 5,             // Min idle connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,  // Query timeout 10s
});
```

### 5.5 Response Payload Optimization

- Job listing: KHÔNG trả `description` đầy đủ, chỉ `descriptionPreview` (200 chars đầu)
- Worker listing: chỉ trả top 5 skills, không tất cả
- Leaderboard: chỉ trả cần thiết (fullName, avatarUrl, role, points)

### 5.6 Frontend Performance

```
- [ ] Bundle size analysis: next-bundle-analyzer
- [ ] Lazy loading cho non-critical pages (leaderboard, progress)
- [ ] Image optimization: next/image cho avatars
- [ ] Dynamic imports cho heavy components (FilterSidebar, charts)
- [ ] API response caching: React Query / SWR nếu chưa có
- [ ] Prefetch: Link prefetch cho navigation chính
```

### 5.7 Database Maintenance

```sql
-- Scheduled maintenance queries
VACUUM ANALYZE jobs;
VACUUM ANALYZE point_transactions;
VACUUM ANALYZE reviews;

-- Clean up expired refresh tokens
DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

-- Clean up old point transactions index
REINDEX INDEX idx_point_tx_weekly;
```

---

## 6. OBSERVABILITY

### 6.1 Structured Logging Review

**Checklist:**
```
- [ ] Winston configured consistently trên tất cả files
- [ ] Log format: JSON cho production, pretty cho development
- [ ] Log levels: error, warn, info, debug (configurable via env)
- [ ] Correlation ID (request ID) gắn vào mọi log entry
- [ ] Request/response logging (method, path, status, duration)
- [ ] Auth events logged (login, register, logout, refresh, failed attempts)
- [ ] Business events logged (job.created, job.published, review.created, points.awarded)
- [ ] Error logging: stack trace + context (userId, requestId, endpoint)
- [ ] Sensitive data NOT logged (passwords, tokens, email addresses in logs)
- [ ] Log rotation / size management configured
```

### 6.2 Sentry Error Tracking Review

```
- [ ] Sentry DSN configured cho cả backend và frontend
- [ ] Environment tag: development, staging, production
- [ ] Release version tag
- [ ] User context attached (userId, role — NOT email)
- [ ] Breadcrumbs: API calls, navigation, errors
- [ ] Performance monitoring: transaction tracing
- [ ] Alert rules: new error → notification, error spike → alert
- [ ] Source maps uploaded cho frontend (production build)
```

### 6.3 Health Check Enhancement

**Từ M1 có basic health check. Nâng cấp:**

```typescript
// GET /api/v1/health → basic health (uptime, timestamp)
// GET /api/v1/health/deep → deep health check (DB, cache, external)

interface DeepHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: 'up' | 'down'; responseTimeMs: number };
    cache: { status: 'up' | 'down'; hitRate?: number };
    diskSpace: { status: 'ok' | 'warning' | 'critical'; freeGB: number };
  };
}
```

### 6.4 Application Metrics

**Metrics cần collect (expose via /api/v1/metrics hoặc log):**

| Metric | Type | Mô tả |
|---|---|---|
| `http_request_duration_ms` | Histogram | Response time per endpoint |
| `http_requests_total` | Counter | Total requests per method/path/status |
| `http_errors_total` | Counter | 4xx/5xx errors |
| `db_pool_active` | Gauge | Active DB connections |
| `db_pool_idle` | Gauge | Idle DB connections |
| `db_query_duration_ms` | Histogram | Database query time |
| `auth_login_attempts` | Counter | Login attempts (success/failure) |
| `jobs_published_total` | Counter | Jobs published |
| `points_awarded_total` | Counter | Points awarded |

**Implementation:** Dùng `prom-client` (Prometheus client library) hoặc custom logging metrics.

---

## 7. BACKUP & RESTORE

### 7.1 Backup Strategy

| Hạng mục | Quyết định |
|---|---|
| **Tool** | `pg_dump` (logical backup) |
| **Frequency** | Daily, scheduled via cron hoặc CI |
| **Retention** | 7 daily backups + 4 weekly backups |
| **Storage** | Local + cloud (S3/GCS bucket hoặc tương đương) |
| **Format** | Custom format (`-Fc`) cho flexibility |
| **Compression** | Built-in compression |

### 7.2 Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
BACKUP_FILE="${BACKUP_DIR}/gig_marketplace_${TIMESTAMP}.dump"

mkdir -p ${BACKUP_DIR}

# Dump database
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  -Fc --no-owner --no-privileges \
  -f ${BACKUP_FILE}

echo "Backup created: ${BACKUP_FILE}"
echo "Size: $(du -sh ${BACKUP_FILE} | cut -f1)"

# Clean old backups (keep 7 days)
find ${BACKUP_DIR} -name "*.dump" -mtime +7 -delete

# Optional: upload to cloud storage
# aws s3 cp ${BACKUP_FILE} s3://${S3_BUCKET}/backups/
```

### 7.3 Restore Procedure

```bash
#!/bin/bash
# scripts/restore-db.sh

set -euo pipefail

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: ./restore-db.sh <backup_file>"
  exit 1
fi

echo "⚠️  WARNING: This will REPLACE the current database!"
echo "Backup file: ${BACKUP_FILE}"
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

# Drop and recreate database
psql -h ${DB_HOST} -U ${DB_USER} -d postgres -c "
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';
  DROP DATABASE IF EXISTS ${DB_NAME};
  CREATE DATABASE ${DB_NAME};
"

# Restore from backup
pg_restore -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} \
  --no-owner --no-privileges \
  ${BACKUP_FILE}

echo "✅ Restore completed successfully"
```

### 7.4 Backup Monitoring

```
- [ ] Backup script chạy daily (cron / scheduled task)
- [ ] Backup size logged
- [ ] Alert nếu backup fail (exit code != 0)
- [ ] Restore test: thực hiện restore trên test database monthly
- [ ] Backup file encryption nếu chứa sensitive data → extension point
```

---

## 8. CI/CD PIPELINE HARDENING

### 8.1 GitHub Actions Pipeline (Cập nhật)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20  }
      - run: npm ci
      - run: npm audit --audit-level=high

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: gig_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run migrate:test
      - run: npm run test:backend -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: apps/api/coverage/

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run test:frontend -- --coverage

  build:
    needs: [lint-and-typecheck, security-audit, test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run build
```

### 8.2 Database Migration Safety

```
- [ ] Migrations forward-only (never edit existing migration)
- [ ] New migrations backward compatible (add column, NOT rename/drop)
- [ ] Migration tested in CI with test database
- [ ] Migration rollback procedure documented
- [ ] Lock timeout set cho ALTER TABLE (avoid blocking)
```

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M7)

- ❌ Feature mới — M7 chỉ hardening
- ❌ Redis setup (dùng node-cache in-memory cho MVP)
- ❌ Elasticsearch migration
- ❌ CDN setup (M8)
- ❌ Production deployment (M8)
- ❌ Monitoring dashboard setup (M8)
- ❌ WAF / DDoS protection (post-launch)
- ❌ GDPR / data privacy compliance (post-launch)
- ❌ Penetration testing professional (post-launch)

---

## 10. YÊU CẦU OUTPUT CỦA BẠN

### Thứ tự triển khai đề xuất:
1. Security audit — Input validation, SQL review
2. HTTP security headers — Helmet config review
3. CORS + Rate limiting review
4. Auth hardening — Token, password, cookie review
5. Dependency vulnerability scan
6. Error message review
7. Backend unit tests — Domain + Application layers
8. Backend integration tests — All API endpoints
9. Frontend component tests
10. E2E tests — Critical flows
11. Database query audit — EXPLAIN ANALYZE
12. Performance tuning — Caching, connection pool, payload optimization
13. Observability — Logging review, Sentry config, health check, metrics
14. Backup scripts — backup + restore + test
15. CI/CD pipeline update
16. Load test
17. Documentation update

### Checklist kiểm tra M7 Done

```
SECURITY:
- [ ] Input validation audit — 100% API endpoints validated
- [ ] SQL injection check — 100% parameterized queries
- [ ] ILIKE search input escaped (%, _, \)
- [ ] Helmet security headers configured
- [ ] CORS: origin whitelist (not *)
- [ ] Rate limiting: tất cả route groups configured
- [ ] JWT secret ≥ 256 bit
- [ ] Cookie: httpOnly=true, secure=true, sameSite=strict
- [ ] npm audit: 0 critical, 0 high
- [ ] Error responses: no stack traces, no DB details
- [ ] Secrets: 0 hardcoded values

TESTING:
- [ ] Backend domain tests: >90% coverage
- [ ] Backend application tests: >85% coverage
- [ ] Backend integration tests: tất cả ~30 API endpoints covered
- [ ] Frontend key component tests: >60% coverage
- [ ] E2E tests: 6 critical flows passing
- [ ] Auth edge cases tested (expiry, rotation, reuse detection)
- [ ] Load test: p95 < 500ms listing, <200ms detail @ 50 concurrent

PERFORMANCE:
- [ ] EXPLAIN ANALYZE: 0 sequential scans on large tables
- [ ] No slow queries > 1s
- [ ] In-memory cache: categories, skills, achievements
- [ ] DB connection pool: configured (20 max)
- [ ] Response payload: listing endpoints use preview/summary
- [ ] Frontend: bundle < 500KB gzipped

OBSERVABILITY:
- [ ] Structured logging: consistent JSON, correlation ID
- [ ] Log levels: configurable via env
- [ ] Sentry: configured for BE + FE, environment tagged
- [ ] Health check: /api/v1/health/deep checks DB
- [ ] Application metrics: request duration, error rate logged
- [ ] Sensitive data NOT in logs

BACKUP:
- [ ] backup-db.sh script works
- [ ] restore-db.sh script works
- [ ] Restore test completed successfully
- [ ] Old backup cleanup (7 day retention)

CI/CD:
- [ ] Pipeline: lint + typecheck + security audit + test + build
- [ ] Pipeline runs on PR + push to main
- [ ] Test database in CI (PostgreSQL service)
- [ ] Coverage reports uploaded
- [ ] Migration tested in CI

DOCUMENTATION:
- [ ] README updated (security, testing, backup commands)
- [ ] .env.example updated
- [ ] API documentation current
```

---

## 11. LƯU Ý QUAN TRỌNG

1. **KHÔNG phá feature** — M7 hardening thì tất cả existing features phải vẫn work.
2. **Test trước fix** — viết test trước, verify fail, rồi fix.
3. **Incremental** — commit thường xuyên, mỗi PR scope nhỏ (security PR, testing PR, performance PR).
4. **In-memory cache, KHÔNG Redis** — keep simple cho MVP. Redis là extension point.
5. **Load test realistic** — dùng seed data, 50 concurrent users, 5 min duration.
6. **Backup test thật** — restore lên test database, verify data integrity.
7. **CI pipeline must pass** — tất cả checks green trước khi merge.
