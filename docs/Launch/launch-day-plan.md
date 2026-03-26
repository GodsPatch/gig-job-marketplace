# Launch Day Plan

> Timeline and monitoring cadence for launch day.

---

## D-Day Timeline

| Time | Action | Owner |
|---|---|---|
| **T-60min** | Final deployment to production (if needed) | DevOps |
| **T-30min** | Smoke test all critical flows (register, login, create job, search) | QA |
| **T-15min** | Check all monitoring dashboards are green | DevOps |
| **T-0** | 🚀 **LAUNCH** — Enable public access | PM |
| **T+15min** | Monitor error rate, response times | DevOps |
| **T+30min** | First status check — Sentry, UptimeRobot | DevOps |
| **T+1hr** | Detailed monitoring review | DevOps |
| **T+2hr** | Status update to stakeholders | PM |
| **T+4hr** | Mid-day review: errors, performance, user reports | Team |
| **T+8hr** | End of launch day review | Team |

## Post-Launch Monitoring Cadence

| Period | Check Frequency | What to Monitor |
|---|---|---|
| **Hour 1-4** | Every 15 min | Error rate, response times, uptime |
| **Hour 4-8** | Every 30 min | Same + user sign-ups |
| **Hour 8-24** | Every 1 hour | Same + DB connections |
| **Day 2-7** | Daily review | Sentry summary, uptime%, performance |
| **Week 2+** | Weekly review | Trends, scaling needs |

## Post-Launch Review (D+7)

After 7 days, conduct a formal review:

- [ ] Total users registered
- [ ] Total jobs posted
- [ ] Uptime percentage
- [ ] Average response time (p50, p95)
- [ ] Error rate and top errors
- [ ] User feedback summary
- [ ] Performance vs benchmarks (< 3s page load)
- [ ] Known issues → roadmap for fixes
- [ ] Lessons learned

## Emergency Contacts

| Role | Contact | Responsibility |
|---|---|---|
| **Lead Developer** | _______________ | Code fixes, debugging |
| **DevOps** | _______________ | Infrastructure, scaling, rollback |
| **Product Manager** | _______________ | Stakeholder comms, Go/No-Go |
| **DBA** | _______________ | Database issues, restore |
