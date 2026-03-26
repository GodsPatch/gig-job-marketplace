# Pre-Launch Checklist

> Verify ALL items before proceeding to launch day.

---

## Infrastructure

- [ ] Production backend deployed and healthy (`/api/v1/health` returns 200)
- [ ] Production frontend deployed and accessible
- [ ] Production database migrated (all 16 tables created)
- [ ] SSL certificates active (HTTPS working on both domains)
- [ ] Domain DNS configured and propagated
- [ ] CORS configured for production domain only

## Security

- [ ] `NODE_ENV=production` set on backend
- [ ] `JWT_SECRET` is production-grade (≥32 chars, randomly generated)
- [ ] `REFRESH_TOKEN_SECRET` is production-grade (different from JWT_SECRET)
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] Database firewall: only allow app connections
- [ ] No debug/dev endpoints exposed
- [ ] Helmet security headers verified
- [ ] Rate limiting active on all routes

## Monitoring

- [ ] UptimeRobot: API health monitor configured (5 min interval)
- [ ] UptimeRobot: Frontend monitor configured (5 min interval)
- [ ] UptimeRobot: Deep health check monitor configured (15 min interval)
- [ ] Sentry: backend project configured (production environment)
- [ ] Sentry: frontend project configured (production environment)
- [ ] Alert channels verified (test alert sent + received)
- [ ] DigitalOcean monitoring dashboard accessible

## Data

- [ ] Categories seeded (10 categories)
- [ ] Skills seeded (30+ skills)
- [ ] Achievement definitions seeded (15 achievements)
- [ ] Admin user created (password to be changed after first login)
- [ ] No test/dummy data in production database

## Backup

- [ ] Initial production backup taken
- [ ] Backup script tested (`scripts/backup-db.sh`)
- [ ] Restore procedure verified (`scripts/restore-db.sh`)
- [ ] Backup schedule documented (daily)

## Documentation

- [ ] Operations runbook complete and accessible
- [ ] Team knows rollback procedure
- [ ] Escalation contacts documented
- [ ] UAT sign-off document signed

## Deployment

- [ ] GitHub Actions deploy workflow tested on staging
- [ ] Manual trigger confirmed (not auto-deploy to prod)
- [ ] Smoke test post-deploy passes
- [ ] Rollback procedure tested on staging

---

## Decision

| Item | Status |
|---|---|
| All items checked? | ☐ Yes ☐ No |
| Decision | ☐ **GO** ☐ **NO-GO** |
| Approved by | ___________________ |
| Date | ___________________ |
