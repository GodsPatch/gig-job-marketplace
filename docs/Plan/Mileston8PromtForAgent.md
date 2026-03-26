# Implementation Prompt — Milestone 8: Launch

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M8 – Launch
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M8

---

Bạn là Senior DevOps / Platform Engineer. Nhiệm vụ: triển khai **Milestone 8 (Launch)** cho dự án "Gig Job Marketplace" — đưa sản phẩm ra production thực sự.

**Lưu ý:** M8 KHÔNG thêm feature mới. Tập trung vào UAT, deploy production, monitoring, và runbook vận hành.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — đã feature complete (M1→M6) và production-hardened (M7).

### Milestone roadmap
- M1 – Foundation Ready ✅
- M2 – User System Ready ✅
- M3 – Job Core Ready ✅
- M4 – Discovery Ready ✅
- M5 – Marketplace Ready ✅
- M6 – Gamification Ready ✅
- M7 – Production Ready ✅
- **M8 – Launch ← BẠN ĐANG LÀM CÁI NÀY**

### Tech stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express.js, TypeScript, Clean Architecture
- **Database**: PostgreSQL 16
- **Infra**: Docker, npm workspaces monorepo, GitHub Actions CI
- **Monitoring (từ M7)**: Winston logging, Sentry error tracking, in-memory cache
- **Testing (từ M7)**: Jest, Supertest, >80% coverage, E2E tests, load tests

### Tất cả features đã có
- Auth (register, login, refresh, logout, roles)
- User profiles, worker profiles, skills
- Job lifecycle (draft → published → closed)
- Job discovery (search, filter, sort, trending)
- Worker listing/search
- Public profiles
- Review/rating system
- Gamification (points, achievements, leaderboard)

### Database: 16 tables
users, refresh_tokens, categories, jobs, skills, worker_profiles, worker_skills, reviews, point_transactions, user_points_summary, achievement_definitions, user_achievements, leaderboard_snapshots

### API: ~30 endpoints đã test + hardened từ M7

---

## 2. MỤC TIÊU MILESTONE M8

| Hạng mục | Mục tiêu |
|---|---|
| **UAT** | Stakeholders verify tất cả tính năng, 0 critical/major bugs |
| **Production deploy** | Application live trên production infrastructure |
| **Monitoring** | Dashboard real-time: health, performance, errors, uptime |
| **Runbook** | Tài liệu vận hành đầy đủ cho team |

---

## 3. QUYẾT ĐỊNH KỸ THUẬT ĐÃ CHỐT

### 3.1 Hosting Strategy

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| **Cloud Provider** | **DigitalOcean** | Phù hợp MVP budget, đơn giản, đủ cho scale ban đầu |
| **Backend** | DigitalOcean App Platform (Docker container) | PaaS — auto deploy, managed container, zero-downtime deploy |
| **Frontend** | Vercel (Next.js native) | Best-in-class cho Next.js, CDN global, auto deploy |
| **Database** | DigitalOcean Managed PostgreSQL | Managed — auto backup, failover, monitoring built-in |
| **Alternative** | Railway / Render nếu budget tối thiểu hơn | Simpler setup nhưng ít control |

**Rationale:** Tách frontend (Vercel) và backend (DO App Platform) cho:
- Frontend hưởng CDN + edge functions của Vercel
- Backend deploy độc lập, scale riêng
- Database managed giảm ops overhead

### 3.2 Environment Strategy

| Environment | Mục đích | Infrastructure |
|---|---|---|
| **Development** | Local dev | Docker Compose (PostgreSQL local) |
| **Staging** | Pre-production testing, UAT | DO App Platform (dev tier) + Managed DB (basic) |
| **Production** | Live | DO App Platform (production) + Managed DB (production) |

### 3.3 Domain & SSL

| Hạng mục | Quyết định |
|---|---|
| **Domain** | `gigmarketplace.vn` (ví dụ — thay bằng domain thật) |
| **Frontend** | `gigmarketplace.vn` (Vercel custom domain) |
| **Backend API** | `api.gigmarketplace.vn` (DO App Platform) |
| **SSL** | Auto SSL (Let's Encrypt) qua Vercel + DigitalOcean |
| **DNS** | Managed DNS trên DigitalOcean hoặc Cloudflare |

### 3.4 Deployment Strategy

| Hạng mục | Quyết định |
|---|---|
| **Strategy** | Rolling deployment (DO App Platform tự quản lý) |
| **Trigger** | Manual trigger cho production deploy (GitHub Actions workflow_dispatch) |
| **Migration** | Run trước deploy, backward compatible |
| **Rollback** | Revert to previous container image / Vercel deployment |
| **Smoke test** | Automated post-deploy health check |

---

## 4. UAT (USER ACCEPTANCE TESTING)

### 4.1 UAT Process

```
1. Deploy lên Staging environment
2. Stakeholders test theo UAT checklist
3. Bug report → categorize (critical/major/minor)
4. Fix critical + major bugs
5. Re-test fixed items
6. UAT sign-off khi pass criteria met
7. Go/No-Go decision
```

### 4.2 UAT Test Scenarios

#### M2 — Auth & User

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 1 | Register | Nhập email + password + name → Submit | Account created, redirect to login |
| 2 | Register duplicate | Email đã tồn tại → Submit | Error: email đã được sử dụng |
| 3 | Login | Email + password đúng | Login success, see dashboard |
| 4 | Login wrong password | Password sai | Error: thông tin không đúng |
| 5 | View profile | Navigate to /profile | See user info |
| 6 | Edit profile | Change name, bio → Save | Profile updated |
| 7 | Logout | Click logout | Session ended |
| 8 | Session refresh | Wait 15+ min, interact | Auto refresh, no re-login |

#### M3 — Job Core

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 9 | Create job | Fill form → Save draft | Job created as draft |
| 10 | Edit draft | Modify fields → Save | Draft updated |
| 11 | Publish job | Click publish on valid draft | Status → published, visible publicly |
| 12 | Publish invalid | Missing required fields → Publish | Error with details |
| 13 | Close job | Close published job | Status → closed |
| 14 | View own jobs | Navigate to /jobs/me | See all own jobs |
| 15 | View published job | Navigate to /jobs/:slug (public) | See job detail |
| 16 | View draft (non-owner) | Navigate to draft job slug | 404 |

#### M4 — Discovery

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 17 | Home page | Navigate to / | See hero, trending, categories, latest |
| 18 | Search keyword | Type keyword → search | Relevant results |
| 19 | Filter by category | Select category | Filtered results |
| 20 | Filter by location | Select remote/onsite | Filtered results |
| 21 | Sort by budget | Sort budget desc | Sorted correctly |
| 22 | Pagination | Navigate pages | Correct pages |
| 23 | URL sync | Copy URL with filters → open in new tab | Same filters/results |
| 24 | Category page | Navigate /categories/:slug | Category jobs listing |
| 25 | Empty search | Search gibberish keyword | Empty state message |

#### M5 — Marketplace

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 26 | Edit worker profile | Update title, skills, rate | Profile saved |
| 27 | Worker listing | Navigate /workers | See workers with filters |
| 28 | Public profile (worker) | View /users/:id | See skills, rating, reviews |
| 29 | Public profile (employer) | View /users/:id | See jobs posted, rating |
| 30 | Create review | On closed job → submit review | Review created |
| 31 | Duplicate review | Try review same job again | Error: already reviewed |
| 32 | Rating display | Check profile after review | Rating updated |

#### M6 — Gamification

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 33 | Earn points | Publish job → check points | +20 points earned |
| 34 | View progress | Navigate /progress | Points, achievements, rank |
| 35 | Achievement unlock | Meet condition | Achievement badge unlocked |
| 36 | Leaderboard | Navigate /leaderboard | Rankings displayed |
| 37 | Point history | View in progress page | Transaction history |
| 38 | Login streak | Login consecutive days | Streak counter increases |

#### Cross-cutting

| # | Scenario | Steps | Expected |
|---|---|---|---|
| 39 | Mobile responsive | Test on mobile viewport | All pages usable |
| 40 | Loading states | Slow network simulation | Skeleton/spinner shown |
| 41 | Error handling | API error simulation | Error message, retry option |
| 42 | Navigation | Click through all nav links | All pages load correctly |

### 4.3 UAT Pass Criteria

| Criteria | Requirement |
|---|---|
| **Critical bugs** | 0 unresolved |
| **Major bugs** | 0 unresolved |
| **Minor bugs** | ≤ 5 (documented for post-launch fix) |
| **Test coverage** | ≥ 95% scenarios passed |
| **Performance** | Pages load < 3s on 4G |
| **Sign-off** | Stakeholder approval documented |

### 4.4 Bug Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| **Critical** | App unusable, data loss, security breach | Login broken, SQL injection |
| **Major** | Feature broken, significant UX issue | Search returns wrong results, review not saving |
| **Minor** | Cosmetic, minor UX, workaround exists | Text alignment, typo, minor styling |

---

## 5. PRODUCTION INFRASTRUCTURE SETUP

### 5.1 DigitalOcean App Platform — Backend

```yaml
# .do/app.yaml
name: gig-marketplace-api
services:
  - name: api
    source:
      github:
        repo: org/gig-marketplace
        branch: main
        deploy_on_push: false  # Manual trigger
    build_command: cd apps/api && npm run build
    run_command: cd apps/api && npm run start:prod
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: professional-xs  # 1 vCPU, 1GB RAM
    http_port: 3001
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
        type: SECRET
      - key: JWT_SECRET
        type: SECRET
      - key: SENTRY_DSN
        type: SECRET
      - key: FRONTEND_URL
        value: https://gigmarketplace.vn

databases:
  - name: db
    engine: PG
    version: "16"
    size: db-s-1vcpu-1gb
    num_nodes: 1
```

### 5.2 Vercel — Frontend

```json
// vercel.json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.gigmarketplace.vn"
  }
}
```

### 5.3 Production Environment Variables

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:25060/gig_marketplace?sslmode=require
JWT_SECRET=<generated-256-bit-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SENTRY_DSN=https://xxx@sentry.io/xxx
FRONTEND_URL=https://gigmarketplace.vn
LOG_LEVEL=info
CORS_ORIGIN=https://gigmarketplace.vn
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.gigmarketplace.vn
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 5.4 Production Database Setup

```bash
# 1. Create managed PostgreSQL on DigitalOcean
# 2. Get connection string
# 3. Run migrations
NODE_ENV=production npm run migrate:up

# 4. Seed production data
NODE_ENV=production npm run seed:production
# Seeds: categories, skills, achievement_definitions, admin user
```

### 5.5 Production Seed Data

```sql
-- Admin user (password: change immediately after first login)
INSERT INTO users (email, password_hash, full_name, role, status) VALUES
  ('admin@gigmarketplace.vn', '$2b$12$...', 'Admin', 'admin', 'active');

-- Categories: giữ nguyên seed từ M3
-- Skills: giữ nguyên seed từ M5
-- Achievement definitions: giữ nguyên seed từ M6
```

---

## 6. DEPLOYMENT PIPELINE

### 6.1 Production Deploy Workflow (GitHub Actions)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "deploy-production" to confirm'
        required: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Confirm deployment
        run: |
          if [ "${{ github.event.inputs.confirm }}" != "deploy-production" ]; then
            echo "❌ Deployment not confirmed. Type 'deploy-production' to proceed."
            exit 1
          fi

  test:
    needs: validate
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: gig_test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm audit --audit-level=high
      - run: npm run migrate:test
      - run: npm run test -- --coverage
      - run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to DigitalOcean App Platform
        uses: digitalocean/app_action@v1
        with:
          app_name: gig-marketplace-api
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  smoke-test:
    needs: [deploy-backend, deploy-frontend]
    runs-on: ubuntu-latest
    steps:
      - name: Wait for deployment
        run: sleep 60

      - name: Health check API
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.gigmarketplace.vn/api/v1/health)
          if [ "$STATUS" != "200" ]; then
            echo "❌ API health check failed: $STATUS"
            exit 1
          fi
          echo "✅ API healthy"

      - name: Health check Frontend
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gigmarketplace.vn)
          if [ "$STATUS" != "200" ]; then
            echo "❌ Frontend health check failed: $STATUS"
            exit 1
          fi
          echo "✅ Frontend healthy"

      - name: API smoke test
        run: |
          # Categories endpoint
          curl -sf https://api.gigmarketplace.vn/api/v1/categories
          # Public jobs
          curl -sf https://api.gigmarketplace.vn/api/v1/jobs/public
          echo "✅ Smoke tests passed"

  notify:
    needs: smoke-test
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify result
        run: |
          if [ "${{ needs.smoke-test.result }}" == "success" ]; then
            echo "🚀 Production deployment successful!"
          else
            echo "❌ Production deployment FAILED! Check logs."
          fi
```

### 6.2 Rollback Procedure

```bash
# Backend rollback — DigitalOcean App Platform
# Option 1: Revert to previous deployment in DO dashboard
# Option 2: Revert git commit + trigger deploy

# Frontend rollback — Vercel
# Vercel dashboard → Deployments → promote previous deployment

# Database rollback
# ⚠️ Only if migration caused issues
# Restore from latest backup (see scripts/restore-db.sh from M7)
```

---

## 7. MONITORING DASHBOARD

### 7.1 Tool Selection

| Tool | Purpose | Cost |
|---|---|---|
| **Sentry** | Error tracking + performance monitoring | Free tier (5K events/month) |
| **UptimeRobot** | Uptime monitoring + alerts | Free tier (50 monitors) |
| **DigitalOcean Monitoring** | Server metrics (CPU, memory, disk) | Included |
| **DigitalOcean DB Metrics** | Database metrics | Included |
| **Custom /health/deep** | Application health | Built-in |

### 7.2 UptimeRobot Setup

| Monitor | URL | Interval | Alert |
|---|---|---|---|
| API Health | `https://api.gigmarketplace.vn/api/v1/health` | 5 min | Email + Slack |
| Frontend | `https://gigmarketplace.vn` | 5 min | Email + Slack |
| API Deep Health | `https://api.gigmarketplace.vn/api/v1/health/deep` | 15 min | Email |

### 7.3 Sentry Configuration

```
Backend project:
- Environment: production
- Release: git commit hash
- Alerts: new error → email, error spike (>10/hour) → email + Slack
- Performance: transaction tracing enabled

Frontend project:
- Environment: production
- Source maps: uploaded on deploy
- Alerts: same as backend
```

### 7.4 Alert Rules

| Alert | Condition | Channel | Severity |
|---|---|---|---|
| **Downtime** | Health check fail > 2 consecutive | Email + Slack | 🔴 Critical |
| **Error spike** | >10 errors/hour | Email + Slack | 🟡 Warning |
| **Slow response** | p95 > 2s sustained 10min | Email | 🟡 Warning |
| **DB connection** | Pool exhausted / connection error | Email + Slack | 🔴 Critical |
| **Disk space** | > 80% used | Email | 🟡 Warning |
| **Certificate expiry** | SSL expires in 14 days | Email | 🟡 Warning |

### 7.5 Status Page (Optional but recommended)

Dùng **UptimeRobot status page** (free) hoặc **Instatus** cho public status:
- URL: `status.gigmarketplace.vn`
- Components: API, Website, Database
- Incident history

---

## 8. RUNBOOK

### 8.1 Runbook: Deployment

```markdown
## Deployment Procedure
1. Merge PR to `main` branch
2. Go to GitHub Actions → "Deploy to Production"
3. Click "Run workflow" → type "deploy-production" → Run
4. Monitor pipeline (5-10 min)
5. Verify smoke tests pass
6. Check Sentry for new errors (15 min observation)
7. Check UptimeRobot status
8. If issues → rollback (see Rollback section)
```

### 8.2 Runbook: Rollback

```markdown
## Rollback Procedure
### Backend:
1. Go to DigitalOcean → Apps → gig-marketplace-api
2. Activity tab → find previous successful deployment
3. Click "Rollback to this deployment"
4. Wait for rollback (2-3 min)
5. Verify health check: curl https://api.gigmarketplace.vn/api/v1/health

### Frontend:
1. Go to Vercel → Project → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"
4. Verify: curl https://gigmarketplace.vn

### Database (only if migration issue):
1. Identify problematic migration
2. Connect to DB: psql $DATABASE_URL
3. Manually reverse changes (documented per migration)
4. OR restore from backup: ./scripts/restore-db.sh <backup_file>
```

### 8.3 Runbook: Database Operations

```markdown
## Manual Backup
./scripts/backup-db.sh

## Restore from Backup
./scripts/restore-db.sh /backups/postgresql/gig_marketplace_YYYYMMDD.dump

## Run Migrations
NODE_ENV=production npm run migrate:up

## Connect to Production DB
psql $DATABASE_URL

## Check Active Connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'gig_marketplace';

## Check Slow Queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

## Cleanup Expired Tokens
DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

## Vacuum & Analyze
VACUUM ANALYZE;
```

### 8.4 Runbook: Incident Response

```markdown
## Incident Response Template

### 1. Detection
- [ ] How detected: (alert / user report / monitoring)
- [ ] Time of detection: ___
- [ ] Severity: (critical / major / minor)

### 2. Assessment
- [ ] Impact scope: (all users / specific feature / specific users)
- [ ] Root cause hypothesis: ___

### 3. Response
- [ ] Immediate action taken: ___
- [ ] Rollback needed: (yes / no)
- [ ] Communication sent to stakeholders: (yes / no)

### 4. Resolution
- [ ] Fix applied: ___
- [ ] Verified fix: ___
- [ ] Time to resolution: ___

### 5. Post-mortem
- [ ] Root cause confirmed: ___
- [ ] Prevention measures: ___
- [ ] Follow-up tasks created: ___
```

### 8.5 Runbook: Scaling Guide

```markdown
## Vertical Scaling
### Backend (DO App Platform):
1. App → Settings → Resources
2. Increase instance size (1GB → 2GB → 4GB)
3. Apply (zero-downtime)

### Database (DO Managed):
1. Databases → Resize
2. Select larger plan
3. Confirm (brief maintenance window)

## Horizontal Scaling (if needed later)
### Backend:
1. Increase instance count (1 → 2 → 3)
2. DO App Platform handles load balancing
3. Ensure app is stateless (no in-memory sessions — confirmed: JWT stateless)

### Database read replicas (extreme scale):
1. Add read replica in DO dashboard
2. Update app to use read replica for listing queries
3. Extension point — not needed at launch
```

### 8.6 Runbook: Common Troubleshooting

```markdown
## API returns 503
1. Check DO App Platform → Activity for deploy status
2. Check /api/v1/health/deep
3. If DB down → check DO database status
4. Check logs: DO App Platform → Runtime Logs
5. If OOM → scale up instance

## Frontend returns 500
1. Check Vercel → Deployments → View Logs
2. Check API connectivity from Vercel
3. Try redeployment

## Database connection errors
1. Check DO Databases → Overview (connections, CPU, memory)
2. If max connections → check pool config, look for leaks
3. If disk full → scale up database
4. Check maintenance window schedule

## High error rate
1. Check Sentry → Issues → sort by events
2. Identify top error
3. Check affected users/endpoints
4. If regression → rollback
5. If new behavior → investigate and fix

## Slow performance
1. Check Sentry Performance → slow transactions
2. Check database: pg_stat_statements for slow queries
3. Check cache hit rate
4. Scale up if resource-bound
```

---

## 9. LAUNCH DAY PLAN

### 9.1 Pre-Launch Checklist (D-1)

```
INFRASTRUCTURE:
- [ ] Production backend deployed and healthy
- [ ] Production frontend deployed and healthy
- [ ] Production database migrated + seeded
- [ ] SSL certificates active (HTTPS working)
- [ ] Domain DNS configured and propagated
- [ ] CORS configured for production domain

MONITORING:
- [ ] UptimeRobot monitors active
- [ ] Sentry projects configured (production environment)
- [ ] Alert channels verified (test alert sent + received)
- [ ] DO monitoring dashboard accessible

SECURITY:
- [ ] Environment variables set securely
- [ ] JWT_SECRET is production secret (not dev)
- [ ] Database firewall: only allow app connections
- [ ] No debug/dev endpoints exposed

BACKUP:
- [ ] Initial production backup taken
- [ ] Backup script scheduled (daily)
- [ ] Restore procedure verified

DATA:
- [ ] Categories seeded (10 categories)
- [ ] Skills seeded (30 skills)
- [ ] Achievement definitions seeded (15 achievements)
- [ ] Admin user created
- [ ] No test/dummy data in production

DOCUMENTATION:
- [ ] Runbook complete and accessible
- [ ] Team knows rollback procedure
- [ ] Escalation contacts documented
```

### 9.2 Launch Day Steps (D-Day)

```
T-60min: Final deployment (if needed)
T-30min: Smoke test all critical flows
T-15min: Check all monitoring green
T-0:     🚀 LAUNCH — Enable public access
T+15min: Monitor error rate, response times
T+30min: First status check — all green?
T+1hr:   Detailed monitoring review
T+2hr:   Status update to stakeholders
T+4hr:   Mid-day review
T+8hr:   End of launch day review
```

### 9.3 Post-Launch Monitoring (First 24h)

```
Hour 1-4:   Active monitoring — check every 15 min
Hour 4-8:   Monitoring — check every 30 min
Hour 8-24:  Monitoring — check every 1 hour
Day 2-7:    Daily monitoring review
Week 2+:    Weekly monitoring review
```

### 9.4 Post-Launch Review (D+7)

```
- [ ] Total users registered
- [ ] Total jobs posted
- [ ] Uptime percentage
- [ ] Average response time
- [ ] Error rate
- [ ] Top errors in Sentry
- [ ] User feedback summary
- [ ] Performance vs benchmarks
- [ ] Known issues → roadmap for fixes
- [ ] Lessons learned
```

---

## 10. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M8)

- ❌ Feature mới — chỉ launch
- ❌ Auto-scaling setup (manual scale đủ cho launch)
- ❌ Multi-region deployment
- ❌ Advanced CDN configuration
- ❌ A/B testing infrastructure
- ❌ Analytics platform (Google Analytics, Mixpanel) — post-launch
- ❌ Email notifications (welcome email, review notification) — post-launch
- ❌ Custom error pages (Vercel/DO defaults OK for launch)
- ❌ Load balancer configuration (DO App Platform handles)

---

## 11. YÊU CẦU OUTPUT CỦA BẠN

### Thứ tự triển khai đề xuất:
1. Staging environment setup
2. UAT checklist creation
3. UAT execution + bug fixes
4. Production infrastructure setup (DO + Vercel)
5. Domain + DNS + SSL
6. Production environment variables
7. Production database + migration + seed
8. Deployment pipeline (GitHub Actions)
9. Monitoring setup (UptimeRobot, Sentry production)
10. Alert rules configuration
11. Runbook documentation
12. Pre-launch checklist verification
13. Launch 🚀
14. Post-launch monitoring

### Checklist kiểm tra M8 Done

```
UAT:
- [ ] 42 UAT scenarios tested
- [ ] 0 critical bugs unresolved
- [ ] 0 major bugs unresolved
- [ ] UAT sign-off document signed

INFRASTRUCTURE:
- [ ] Backend deployed on DigitalOcean App Platform
- [ ] Frontend deployed on Vercel
- [ ] Managed PostgreSQL running
- [ ] Domain configured (DNS resolved)
- [ ] SSL active (HTTPS working)
- [ ] CORS configured for production domain

DEPLOYMENT:
- [ ] GitHub Actions deploy workflow works
- [ ] Manual trigger required (not auto-deploy to production)
- [ ] Smoke test post-deploy passes
- [ ] Rollback procedure tested

DATABASE:
- [ ] Production database migrated (16 tables)
- [ ] Production seeded (categories, skills, achievements, admin)
- [ ] Backup script running daily
- [ ] Restore tested successfully
- [ ] Connection string secured (SSL required)

MONITORING:
- [ ] UptimeRobot: API + Frontend monitors active
- [ ] Sentry: production projects configured
- [ ] Alert rules: downtime, error spike → email/Slack
- [ ] DO monitoring dashboard accessible
- [ ] Health check /api/v1/health/deep returns healthy

RUNBOOK:
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Database operations documented
- [ ] Incident response template
- [ ] Scaling guide
- [ ] Common troubleshooting guide
- [ ] Contact/escalation list

LAUNCH:
- [ ] Pre-launch checklist: all items ✅
- [ ] Launch day plan documented
- [ ] Post-launch monitoring plan
- [ ] Stakeholders notified
- [ ] 🚀 Application live and accessible
```

---

## 12. LƯU Ý QUAN TRỌNG

1. **Staging trước** — Test mọi thứ trên staging trước khi deploy production.
2. **Manual deploy** — Production deploy PHẢI manual trigger, KHÔNG auto deploy on push.
3. **Backup trước deploy** — Luôn backup database trước mỗi production deployment.
4. **Monitor sau deploy** — Ít nhất 1 giờ active monitoring sau mỗi deploy.
5. **Rollback sẵn sàng** — Biết trước cách rollback, không cần tìm khi đang panic.
6. **Secrets management** — TUYỆT ĐỐI không commit secrets vào repo.
7. **DNS propagation** — DNS thay đổi mất 1-48h, plan trước.
8. **Communication** — Thông báo stakeholders trước/trong/sau launch.
