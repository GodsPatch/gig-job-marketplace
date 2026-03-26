# Milestone 8: Launch — Implementation Plan

> **Dự án:** Gig Job Marketplace  
> **Milestone:** M8 – Launch  
> **Mục tiêu:** Đưa ứng dụng ra production — không thêm feature mới.

---

## Tổng quan

M8 tập trung vào **6 nhóm deliverables**:

| # | Nhóm | Mô tả | Files |
|---|---|---|---|
| 1 | **Infrastructure Config** | DO App Platform + Vercel + Dockerfile | 4 files mới |
| 2 | **Deploy Pipeline** | GitHub Actions production deploy workflow | 1 file mới |
| 3 | **Production Env Templates** | .env.production templates cho BE & FE | 2 files mới |
| 4 | **Monitoring & Alerts** | Sentry release tracking + health check enhancements | 2 files sửa |
| 5 | **UAT & Launch Docs** | UAT checklist, pre-launch checklist, launch day plan | 3 files mới |
| 6 | **Runbook** | Operations runbook tổng hợp cho team | 1 file mới |

---

## Proposed Changes

### 1. Infrastructure Config

#### [NEW] app.yaml (.do/app.yaml)
DigitalOcean App Platform specification:
- Node.js container, manual deploy, 1 vCPU / 1GB instance
- Build: `cd apps/api && npm ci && npm run build`
- Run: `cd apps/api && npm run start`
- Env vars: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `SENTRY_DSN`, `FRONTEND_URL`

#### [NEW] vercel.json (root)
Vercel deployment config:
- Build: `cd apps/web && npm run build`
- Output: `apps/web/.next`
- Framework: `nextjs`
- Region: `sin1` (Singapore — gần VN)

#### [NEW] Dockerfile (apps/api/Dockerfile)
Multi-stage production Docker build:
- Stage 1: Build TypeScript → JS
- Stage 2: Production image with `node:20-alpine`, non-root user
- Health check: `curl /api/v1/health`

#### [NEW] .dockerignore (apps/api/.dockerignore)
Exclude node_modules, tests, docs from Docker build context.

---

### 2. Deploy Pipeline

#### [NEW] deploy-production.yml (.github/workflows/deploy-production.yml)
Manual-trigger production deploy pipeline:
1. **Validate**: Confirm input = `deploy-production`
2. **Test**: Full CI (lint, typecheck, audit, test, build)
3. **Deploy Backend**: DO App Platform action
4. **Deploy Frontend**: Vercel CLI deploy
5. **Smoke Test**: Health checks (API + Frontend), endpoint verification
6. **Notify**: Success/failure notification

---

### 3. Production Env Templates

#### [NEW] .env.production.example (apps/api/)
Template with all required production env vars + comments.

#### [NEW] .env.production.example (apps/web/)
Template with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SENTRY_DSN`.

---

### 4. Monitoring & Alerts

#### [MODIFY] server.ts (apps/api/src/server.ts)
- Add Sentry release tracking with `process.env.npm_package_version` or git commit hash
- Log startup info (version, environment, port)

#### [MODIFY] app.ts (apps/api/src/app.ts)
- Add production-specific middleware ordering (Sentry request handler before routes)

---

### 5. UAT & Launch Docs

#### [NEW] uat-checklist.md (docs/Launch/)
42 UAT test scenarios from the M8 spec, organized by milestone:
- M2: Auth & User (8 scenarios)
- M3: Job Core (8 scenarios)
- M4: Discovery (9 scenarios)
- M5: Marketplace (7 scenarios)
- M6: Gamification (6 scenarios)
- Cross-cutting (4 scenarios)

#### [NEW] pre-launch-checklist.md (docs/Launch/)
Comprehensive checklist: Infrastructure, Security, Monitoring, Data, Documentation.

#### [NEW] launch-day-plan.md (docs/Launch/)
Timeline from T-60min to T+8hr, post-launch monitoring cadence (24h → 7 days).

---

### 6. Runbook

#### [NEW] runbook.md (docs/Operations/)
Consolidated operations guide:
- Deployment procedure
- Rollback procedure (backend, frontend, DB)
- Database operations (backup, restore, migrations, maintenance)
- Incident response template
- Scaling guide (vertical + horizontal)
- Common troubleshooting

---

## Verification Plan

### Automated Tests
1. `npm run typecheck -w apps/api` — verify server.ts changes compile
2. `npm run build -w apps/api` — verify production build works
3. Dockerfile dry-run: `docker build --target builder apps/api` (if Docker available)

### Manual Verification
- Review all YAML/JSON config files for correct structure
- Verify deploy-production.yml workflow syntax
- Confirm .env templates have all required vars
