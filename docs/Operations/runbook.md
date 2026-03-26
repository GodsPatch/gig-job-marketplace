# Operations Runbook — Gig Job Marketplace

> Tài liệu vận hành cho team DevOps và Developer.

---

## 1. Deployment Procedure

### Standard Deploy

1. Merge PR to `main` branch
2. Go to **GitHub Actions** → "Deploy to Production"
3. Click **"Run workflow"** → type `deploy-production` → Run
4. Monitor pipeline stages (5-10 min):
   - Validate → Test → Deploy Backend → Deploy Frontend → Smoke Test
5. Verify smoke tests pass (auto)
6. Check Sentry for new errors (15 min observation)
7. Check UptimeRobot status page

### Pre-Deploy Checklist

- [ ] All tests pass on `main`
- [ ] Database backup taken (`./scripts/backup-db.sh`)
- [ ] Migrations are backward-compatible
- [ ] No breaking API changes

---

## 2. Rollback Procedure

### Backend (DigitalOcean App Platform)

1. Go to **DigitalOcean** → Apps → `gig-marketplace-api`
2. **Activity** tab → find previous successful deployment
3. Click **"Rollback to this deployment"**
4. Wait for rollback (2-3 min)
5. Verify: `curl https://api.gigmarketplace.vn/api/v1/health`

### Frontend (Vercel)

1. Go to **Vercel** → Project → Deployments
2. Find previous successful deployment
3. Click **"…"** → **"Promote to Production"**
4. Verify: `curl https://gigmarketplace.vn`

### Database (only if migration issue)

1. Identify the problematic migration
2. Option A — Manual reverse: `psql $DATABASE_URL` → reverse changes
3. Option B — Full restore: `./scripts/restore-db.sh <backup_file>`

---

## 3. Database Operations

### Backup

```bash
# Manual backup
./scripts/backup-db.sh

# Backups are stored in ./backups/postgresql/
# Retention: 7 days (auto-cleaned)
```

### Restore

```bash
# Interactive restore (requires confirmation)
./scripts/restore-db.sh ./backups/postgresql/gig_marketplace_YYYYMMDD_HHMMSS.dump
```

### Run Migrations

```bash
# Production
NODE_ENV=production DATABASE_URL=$DATABASE_URL npm run migrate:up -w apps/api

# Rollback last migration
NODE_ENV=production DATABASE_URL=$DATABASE_URL npm run migrate:down -w apps/api
```

### Useful SQL Queries

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'gig_marketplace';

-- Check slow queries (requires pg_stat_statements extension)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Cleanup expired refresh tokens
DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '7 days';

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Vacuum and analyze
VACUUM ANALYZE;
```

---

## 4. Incident Response Template

```
### Incident Report

**Detected:** YYYY-MM-DD HH:MM
**Severity:** Critical / Major / Minor
**Detection method:** Alert / User report / Monitoring

### Assessment
- **Impact scope:** All users / Specific feature / Specific users
- **Root cause hypothesis:** ___
- **Affected endpoints:** ___

### Response
- **Immediate action:** ___
- **Rollback performed:** Yes / No
- **Stakeholders notified:** Yes / No

### Resolution
- **Fix applied:** ___
- **Verified at:** YYYY-MM-DD HH:MM
- **Time to resolution:** ___ min

### Post-mortem
- **Root cause confirmed:** ___
- **Prevention measures:** ___
- **Follow-up tasks:** ___
```

---

## 5. Scaling Guide

### Vertical Scaling

**Backend (DO App Platform):**
1. App → Settings → Resources
2. Increase instance size: `professional-xs` (1GB) → `professional-s` (2GB)
3. Apply (zero-downtime)

**Database (DO Managed):**
1. Databases → Resize
2. Select larger plan
3. Confirm (may have brief maintenance window)

### Horizontal Scaling

**Backend:**
1. App → Settings → instance_count: 1 → 2 → 3
2. DO App Platform handles load balancing automatically
3. ✅ App is stateless (JWT auth, no in-memory sessions)

**Database read replicas (future):**
1. Add read replica in DO dashboard
2. Update connection config for read-only queries
3. Not needed at launch — extension point

---

## 6. Common Troubleshooting

### API returns 503

1. Check DO App Platform → Activity (deploy status)
2. Check `/api/v1/health/deep` — look for `unhealthy` or `degraded`
3. If DB down → check DO database status dashboard
4. Check runtime logs: DO App Platform → Runtime Logs
5. If OOM (out of memory) → scale up instance

### Frontend returns 500

1. Check Vercel → Deployments → View Function Logs
2. Check API connectivity (is backend reachable from Vercel?)
3. Try redeployment from Vercel dashboard

### Database connection errors

1. Check DO Databases → Overview (connections, CPU, memory)
2. If max connections hit → check pool config (`max: 20` in `connection.ts`)
3. If disk full → scale up database plan
4. Check if maintenance window is active

### High error rate

1. Check Sentry → Issues → sort by frequency
2. Identify top error and affected endpoint
3. Check if regression → rollback to previous version
4. If new behavior → investigate, fix, deploy

### Slow performance

1. Check Sentry Performance → slow transactions (p95 > 2s)
2. Check database: `pg_stat_statements` for slow queries
3. Check cache hit rate (categories, skills, achievements should be cached)
4. If resource-bound → scale up backend/database

---

## 7. Important URLs

| Service | URL |
|---|---|
| **API (Production)** | `https://api.gigmarketplace.vn` |
| **Frontend (Production)** | `https://gigmarketplace.vn` |
| **API Health** | `https://api.gigmarketplace.vn/api/v1/health` |
| **API Deep Health** | `https://api.gigmarketplace.vn/api/v1/health/deep` |
| **DigitalOcean Dashboard** | `https://cloud.digitalocean.com` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |
| **Sentry** | `https://sentry.io` |
| **UptimeRobot** | `https://uptimerobot.com` |
| **GitHub Actions** | `https://github.com/org/repo/actions` |

> ⚠️ Replace placeholder URLs with actual production URLs before launch.
