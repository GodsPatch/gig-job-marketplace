# 🎯 SkillSets cho Gig Job Marketplace — Phân vùng theo dự án

> **Mục đích:** Tổ chức skills thành combo skillsets phù hợp **cụ thể** với dự án Gig Job Marketplace (M1→M8).
> Dựa trên phân tích 8 milestones thực tế để xác định đủ 100% work zones cần thiết khi build dự án từ đầu.
>
> **So sánh với bản generic:** File [SkillSets_List.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md) là phiên bản tổng quát.
> File này là phiên bản **project-specific**, thêm/sửa/gộp work zones cho phù hợp dự án thực tế.
>
> **Ngày tạo:** 2026-03-23

---

## Gap Analysis — So sánh Milestone Tasks vs SkillSets Generic

| Công việc từ Milestone | Generic có zone? | Hành động |
|---|:---:|---|
| M1: Setup monorepo, Docker, tooling, CI/CD từ scratch | ❌ Thiếu | ➕ Thêm `/init-project` |
| M2: Auth + Profile (fullstack: API + pages cùng lúc) | ❌ BE+FE tách rời | ➕ Thêm `/fullstack-feature` |
| M3: Job entity lifecycle (draft→published→closed), business rules | ❌ Thiếu domain logic | ➕ Thêm `/business-logic` |
| M4: Search/filter/sort/pagination, trending algorithm | ❌ Thiếu | ➕ Thêm `/search-filter` |
| M5: Worker profiles, skills, reviews, public profiles | ✅ `/backend-api` + `/frontend-ui` | Dùng `/fullstack-feature` |
| M6: Points, achievements, leaderboard | ✅ `/business-logic` | Dùng `/business-logic` |
| M7: Security audit, perf tuning, monitoring, backup | ⚠️ Tách quá nhỏ | 🔄 Gộp thành `/harden` |
| M8: Deploy production, UAT, runbook, monitoring | ⚠️ Generic `/deploy` không đủ | 🔄 Mở rộng thành `/launch` |
| Cross: Fix bugs phát sinh giữa chừng | ✅ `/fix-bug` | Giữ nguyên |
| Cross: Resume từ checkpoint | ✅ `/resume` | Giữ nguyên |
| Cross: Code review | ✅ `/code-review` | Giữ nguyên |
| Cross: Refactor technical debt | ✅ `/refactor` | Giữ nguyên |
| Cross: Multi-agent orchestrate | ✅ `/orchestrate` | Giữ nguyên |

---

## Tổng quan — 15 Work Zones cho dự án

```
┌──────────────────── PHÂN VÙNG DỰ ÁN GIG JOB MARKETPLACE ─────────────────────┐
│                                                                                │
│  === GỐC DỰ ÁN (chỉ chạy 1 lần ở M1) ===                                     │
│  📦  /init-project         Setup greenfield: monorepo, Docker, tooling, CI/CD  │
│                                                                                │
│  === PHÁT TRIỂN FEATURES (M2→M6, lặp lại nhiều lần) ===                       │
│  🔗  /fullstack-feature    Feature xuyên suốt BE+FE (auth, job CRUD, review)  │
│  🧠  /business-logic       Domain logic phức tạp (lifecycle, gamification)     │
│  🔍  /search-filter        Search, filter, sort, pagination, trending          │
│  ⚙️  /backend-api          API endpoint đơn lẻ (không kèm FE)                 │
│  🎨  /frontend-ui          UI page đơn lẻ (không kèm BE mới)                  │
│  🗄️  /database             Schema + migrations + queries                      │
│  🔐  /auth-security        Auth flows + security hardening                     │
│                                                                                │
│  === CHẤT LƯỢNG & BẢO TRÌ (xuyên suốt M1→M8) ===                             │
│  🐛  /fix-bug              Tìm root cause → fix → regression test              │
│  🧪  /testing              Viết test suites (unit, integration, E2E)           │
│  📝  /code-review          Review + nhận feedback code                         │
│  🔄  /refactor             Refactoring + technical debt cleanup                │
│                                                                                │
│  === PRODUCTION (M7→M8) ===                                                    │
│  🛡️  /harden              Security audit + perf tuning + monitoring + backup   │
│  🚀  /launch               Deploy production + UAT + runbook                   │
│                                                                                │
│  === WORKFLOW ===                                                               │
│  ▶️  /resume               Tiếp tục từ checkpoint                              │
│  🤖  /orchestrate          Multi-agent song song                               │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 📦 `/init-project` — Setup dự án từ đầu [MỚI]

> **Khi nào:** M1 — Greenfield, repo chưa có gì.
> **Mục tiêu:** Monorepo hoạt động, Docker chạy, CI green, dev mới clone+run trong 10 phút.
> **Milestone:** M1

### Pipeline

```
brainstorming                      ← Confirm tech stack, architecture decisions
    ↓
writing-plans                      ← Plan 13 phases (monorepo → Docker → BE → FE → CI)
    ↓
executing-plans                    ← Thực thi tuần tự (phase 1→13)
    ↓ per phase:
    ├── nodejs-backend-patterns    ← Express setup, middleware chain, config
    ├── next-best-practices        ← Next.js App Router setup
    ├── postgresql-patterns        ← Docker Compose, baseline migration
    ├── typescript-advanced-types   ← tsconfig, strict mode, path aliases
    ├── security-best-practices    ← Helmet, CORS, env validation
    ├── git-commit                 ← chore: commit từng phase
    └── verification-before-completion ← Verify boot: server + frontend + DB
    ↓
finishing-a-development-branch     ← Merge initial setup
```

### Skills loaded (10)

| # | Skill | Vai trò |
|:---:|---|---|
| 1 | `brainstorming` | Confirm architecture |
| 2 | `writing-plans` | Plan 13 phases |
| 3 | `executing-plans` | Thực thi phased setup |
| 4 | `nodejs-backend-patterns` | Express + Clean Architecture |
| 5 | `next-best-practices` | Next.js 14 App Router |
| 6 | `postgresql-patterns` | Docker Compose + migrations |
| 7 | `typescript-advanced-types` | Strict TS config |
| 8 | `security-best-practices` | Headers, CORS setup |
| 9 | `git-commit` | Incremental commits |
| 10 | `verification-before-completion` | Boot verification |

> ℹ️ **Không dùng TDD ở phase này** — M1 là infrastructure setup, chưa có business logic. TDD bắt đầu từ M2.

---

## 2. 🔗 `/fullstack-feature` — Feature xuyên suốt BE + FE [MỚI]

> **Khi nào:** Feature cần CẢ API endpoint MỚI + frontend pages MỚI đi kèm.
> **Mục tiêu:** API + UI hoạt động end-to-end, tested, consistent.
> **Milestones:** M2 (auth+profile), M3 (job CRUD+pages), M5 (worker+reviews), M6 (gamification)

### Pipeline

```
brainstorming                      ← Design cả BE+FE cùng lúc, define API contract
    ↓
writing-plans                      ← Plan: backend tasks TRƯỚC → frontend tasks SAU
    ↓
using-git-worktrees                ← Isolated branch
    ↓
executing-plans
    ↓ === PHASE 1: Database ===
    ├── postgresql-patterns        ← Schema, migrations, seeds
    ↓ === PHASE 2: Backend ===
    ├── api-design-principles      ← API contract: routes, request/response format
    ├── nodejs-backend-patterns    ← Controllers, use cases, repositories
    ├── test-driven-development    ← Backend tests (Supertest) RED→GREEN
    ↓ === PHASE 3: Frontend ===
    ├── frontend-design            ← Aesthetic direction cho UI mới
    ├── next-best-practices        ← App Router pages, data fetching
    ├── vercel-react-best-practices ← React performance patterns
    ├── tailwind-design-system     ← Styling components
    ├── webapp-testing             ← E2E Playwright test
    ↓ === Shared ===
    ├── typescript-advanced-types   ← Shared types giữa BE↔FE
    ├── git-commit                 ← Commits incremental
    └── verification-before-completion
    ↓
web-design-guidelines              ← Audit UI compliance
    ↓
requesting-code-review             ← Submit for review
    ↓
finishing-a-development-branch     ← Merge
```

### Skills loaded (15)

| # | Skill | Phase | Vai trò |
|:---:|---|---|---|
| 1 | `brainstorming` | Design | Design cả BE+FE |
| 2 | `writing-plans` | Plan | Backend-first plan |
| 3 | `using-git-worktrees` | Setup | Isolated branch |
| 4 | `postgresql-patterns` | DB | Schema + migrations |
| 5 | `api-design-principles` | Backend | API contract |
| 6 | `nodejs-backend-patterns` | Backend | Express implementation |
| 7 | `test-driven-development` | Backend | Test-first development |
| 8 | `frontend-design` | Frontend | Aesthetic direction |
| 9 | `next-best-practices` | Frontend | Next.js patterns |
| 10 | `vercel-react-best-practices` | Frontend | React performance |
| 11 | `tailwind-design-system` | Frontend | Styling |
| 12 | `typescript-advanced-types` | Shared | Types BE↔FE |
| 13 | `webapp-testing` | Test | E2E |
| 14 | `web-design-guidelines` | Audit | UI compliance |
| 15 | `verification-before-completion` | Gate | Evidence |

> ⚠️ **Overlap resolved:** Frontend 3-skill pipeline (P5 rule) vẫn tuần tự: `frontend-design` → `tailwind` → `web-design-guidelines`. Backend-Frontend chạy **sequential** (BE trước, FE sau) — tránh async contract mismatch.

---

## 3. 🧠 `/business-logic` — Domain logic phức tạp [MỚI]

> **Khi nào:** Entity có state transitions, complex validation rules, business calculations.
> **Mục tiêu:** Domain logic chính xác, testable, Clean Architecture compliant.
> **Milestones:** M3 (Job lifecycle), M5 (Review rules), M6 (Points calculation, achievements)

### Pipeline

```
brainstorming                      ← Clarify business rules, edge cases, state machine
    ↓
writing-plans                      ← Plan theo domain layers
    ↓
executing-plans
    ↓ === Layer 1: Domain ===
    ├── typescript-advanced-types   ← Entity types, enums, value objects
    ├── test-driven-development    ← Unit test domain entities TRƯỚC
    │   └── Test state transitions: draft→published→closed (Job)
    │   └── Test calculations: point awarding + cooldown (Gamification)
    │   └── Test constraints: review chỉ cho closed jobs (Review)
    ↓ === Layer 2: Application (Use Cases) ===
    ├── nodejs-backend-patterns    ← Use case classes, DI wiring
    ├── test-driven-development    ← Test use cases với mocked repositories
    ↓ === Layer 3: Infrastructure ===
    ├── postgresql-patterns        ← Repository implementations, queries
    ├── test-driven-development    ← Integration tests with real DB
    ↓ === Layer 4: Interface ===
    ├── api-design-principles      ← Controller, routes, validation
    ↓
    verification-before-completion ← Tất cả layers pass
    ↓
    git-commit                     ← feat: business logic commit
```

### Skills loaded (7)

| # | Skill | Vai trò |
|:---:|---|---|
| 1 | `brainstorming` | Clarify business rules |
| 2 | `writing-plans` | Plan by domain layers |
| 3 | `typescript-advanced-types` | Entity types, discriminated unions |
| 4 | `test-driven-development` | **Core:** test rules TRƯỚC implement |
| 5 | `nodejs-backend-patterns` | Use case DI, middleware |
| 6 | `postgresql-patterns` | Repository queries |
| 7 | `api-design-principles` | API endpoints |

> ⚠️ **Clean Architecture order:** Domain(test) → Application(test) → Infrastructure(test) → Interface. Dependency rule nghiêm ngặt.
> Skill này KHÔNG load frontend skills — chỉ backend domain logic. UI cho domain features dùng `/fullstack-feature`.

---

## 4. 🔍 `/search-filter` — Search, filter, sort, pagination [MỚI]

> **Khi nào:** Dynamic query builders, text search, multi-filter combinations, pagination.
> **Mục tiêu:** Query performant, URL-synced filters, ILIKE escaped, paginated responses.
> **Milestones:** M4 (Job search/filter/trending), M5 (Worker search)

### Pipeline

```
api-design-principles              ← Pagination contract (page/limit/sort/filter params)
    ↓
postgresql-patterns                ← Dynamic WHERE builder, ILIKE escape, indexes
    ├── EXPLAIN ANALYZE for search queries
    ├── Partial indexes for status=published
    ├── GIN/tsvector nếu cần full-text search
    └── Trending algorithm: view_count + recency heuristic
    ↓
nodejs-backend-patterns            ← Query builder utility, pagination middleware
    ↓
test-driven-development            ← Test combinations: keyword+category+location+sort
    ↓
[Frontend URL sync]
    ├── next-best-practices        ← searchParams, URL state management
    ├── vercel-react-best-practices ← Debounced search, avoid waterfalls
    └── tailwind-design-system     ← FilterSidebar, SearchBar components
    ↓
verification-before-completion     ← Performance test: p95 <500ms listing
    ↓
git-commit                         ← feat: search/filter commit
```

### Skills loaded (8)

| # | Skill | Vai trò |
|:---:|---|---|
| 1 | `api-design-principles` | Pagination/filter contract |
| 2 | `postgresql-patterns` | **Core:** dynamic queries, ILIKE, indexes |
| 3 | `nodejs-backend-patterns` | Query builder utility |
| 4 | `test-driven-development` | Test filter combinations |
| 5 | `next-best-practices` | URL searchParams sync |
| 6 | `vercel-react-best-practices` | Debounced search, no waterfalls |
| 7 | `tailwind-design-system` | Filter UI components |
| 8 | `verification-before-completion` | Performance validation |

> ℹ️ **Tách riêng** vì search/filter là bài toán đặc thù: dynamic SQL, performance-critical, cần EXPLAIN ANALYZE, ILIKE escape. Không nên gộp vào `/backend-api` generic.

---

## 5. ⚙️ `/backend-api` — API endpoint đơn lẻ

> **Khi nào:** Thêm endpoint riêng lẻ KHÔNG kèm frontend page mới.
> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #4](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (6)

`api-design-principles` → `nodejs-backend-patterns` → `postgresql-patterns` → `typescript-advanced-types` → `test-driven-development` → `verification-before-completion`

---

## 6. 🎨 `/frontend-ui` — UI page đơn lẻ

> **Khi nào:** Tạo/sửa UI page KHÔNG cần backend endpoint mới.
> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #3](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (8)

`frontend-design` → `tailwind-design-system` → `next-best-practices` → `vercel-react-best-practices` → `typescript-advanced-types` → `web-design-guidelines` → `webapp-testing` → `verification-before-completion`

---

## 7. 🗄️ `/database` — Schema + migrations + queries

> **Khi nào:** Tạo/sửa tables, viết migrations riêng biệt.
> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #5](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (3)

`postgresql-patterns` → `test-driven-development` → `verification-before-completion`

---

## 8. 🔐 `/auth-security` — Auth flows + security

> **Khi nào:** M2 auth implementation, M7 security hardening.
> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #6](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (5)

`better-auth-best-practices` → `security-best-practices` ⚡ → `nodejs-backend-patterns` → `test-driven-development` → `verification-before-completion`

---

## 9. 🐛 `/fix-bug` — Tìm & sửa bug

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #2](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (7-9)

`systematic-debugging` → domain skills (tuỳ bug ở FE/BE/DB) → `test-driven-development` → `verification-before-completion` → `git-commit`

---

## 10. 🧪 `/testing` — Viết test suites

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #7](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (5-7)

`test-driven-development` → `webapp-testing` → `performance-optimization` → domain context skills → `verification-before-completion`

---

## 11. 📝 `/code-review` — Review code

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #8](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (4)

`requesting-code-review` → `receiving-code-review` → `verification-before-completion` → `git-commit`

---

## 12. 🔄 `/refactor` — Refactoring

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #9](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (4-5)

`code-refactoring` → domain context skills → `test-driven-development` → `verification-before-completion` → `git-commit`

---

## 13. 🛡️ `/harden` — Production hardening [MỚI — gộp generic /performance + /deploy]

> **Khi nào:** M7 — Feature complete, cần hardening toàn diện.
> **Mục tiêu:** 0 lỗ hổng critical, >80% coverage, p95 <500ms, observability đầy đủ.
> **Milestone:** M7

### Pipeline

```
=== Security Audit ===
security-best-practices            ← OWASP checklist, Helmet, CORS, rate limiting
    ├── npm audit
    ├── Input validation audit (all Zod schemas)
    ├── SQL injection scan (all repository files)
    └── Error message sanitization

=== Performance Tuning ===
performance-optimization           ← Profile → optimize
    ├── postgresql-patterns        ← EXPLAIN ANALYZE tất cả slow queries
    ├── nodejs-backend-patterns    ← Connection pooling, caching, compression
    └── vercel-react-best-practices ← Bundle analysis, code splitting

=== Testing Coverage ===
test-driven-development            ← Fill missing test gaps
    └── webapp-testing             ← E2E critical flows

=== Monitoring Setup ===
nodejs-backend-patterns            ← Health check deep, application metrics

    ↓ (all hardened)
verification-before-completion     ← Full suite: security + perf + tests + monitoring
    ↓
git-commit                         ← chore: hardening commits
```

### Skills loaded (8)

| # | Skill | Vai trò |
|:---:|---|---|
| 1 | `security-best-practices` | OWASP audit, headers, rate limiting |
| 2 | `performance-optimization` | Profiling, caching, tuning |
| 3 | `postgresql-patterns` | Slow query optimization |
| 4 | `nodejs-backend-patterns` | Health checks, monitoring |
| 5 | `vercel-react-best-practices` | Bundle optimization |
| 6 | `test-driven-development` | Fill coverage gaps |
| 7 | `webapp-testing` | E2E critical flows |
| 8 | `verification-before-completion` | Full evidence |

> ⚠️ Gộp generic `/performance` + phần security audit + monitoring thành 1 zone duy nhất. M7 cần tất cả chạy cùng nhau.

---

## 14. 🚀 `/launch` — Deploy + UAT + Go-live [MỞ RỘNG từ generic /deploy]

> **Khi nào:** M8 — Đưa lên production thật.
> **Mục tiêu:** Deploy live, UAT pass, monitoring dashboard, runbook sẵn sàng.
> **Milestone:** M8

### Pipeline

```
=== Infrastructure Setup ===
using-git-worktrees                ← Deploy config branch
    ├── Dockerfile production
    ├── DigitalOcean App Platform config
    ├── Vercel config (frontend)
    ├── Managed PostgreSQL connection

=== Staging Deploy + UAT ===
    ├── Deploy staging → run smoke tests
    ├── webapp-testing             ← E2E trên staging
    └── verification-before-completion ← UAT checklist pass

=== Production Deploy ===
    ├── Database migration (backward compatible)
    ├── Deploy backend → health check
    ├── Deploy frontend → smoke test
    ├── DNS + SSL verify

=== Post-Launch ===
    ├── Monitoring dashboard active
    ├── Backup schedule confirmed
    ├── Runbook documented
    └── git-commit                 ← chore: production config
```

### Skills loaded (5)

| # | Skill | Vai trò |
|:---:|---|---|
| 1 | `using-git-worktrees` | Deploy config branch |
| 2 | `security-best-practices` | Pre-deploy audit |
| 3 | `webapp-testing` | E2E staging validation |
| 4 | `verification-before-completion` | Post-deploy health checks |
| 5 | `git-commit` | Config commits |

---

## 15. ▶️ `/resume` — Tiếp tục từ checkpoint

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #12](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (5)

`executing-plans` → `test-driven-development` → `typescript-advanced-types` → `verification-before-completion` → `finishing-a-development-branch`

---

## 16. 🤖 `/orchestrate` — Multi-agent

> **Pipeline & Skills:** Giữ nguyên từ [SkillSets_List.md — #13](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List.md)

### Skills loaded (7)

`brainstorming` → `writing-plans` → `dispatching-parallel-agents` → `subagent-driven-development` → `using-git-worktrees` → `verification-before-completion` → `finishing-a-development-branch`

---

## Milestone × Work Zone Mapping

| Milestone | Primary Work Zones | Mô tả |
|---|---|---|
| **M1** Foundation | `/init-project` | Setup greenfield |
| **M2** User System | `/fullstack-feature`, `/auth-security`, `/database` | Auth + Profile (BE+FE) |
| **M3** Job Core | `/fullstack-feature`, `/business-logic`, `/database` | Job CRUD + lifecycle |
| **M4** Discovery | `/search-filter`, `/frontend-ui` | Search + homepage |
| **M5** Marketplace | `/fullstack-feature`, `/business-logic` | Worker + reviews |
| **M6** Gamification | `/business-logic`, `/frontend-ui` | Points + achievements |
| **M7** Production Ready | `/harden`, `/testing` | Security + perf + monitoring |
| **M8** Launch | `/launch` | Deploy + UAT + go-live |
| **Cross** | `/fix-bug`, `/code-review`, `/refactor`, `/resume`, `/orchestrate` | Xuyên suốt |

---

## Quick Reference — Chọn zone theo tình huống

```
"Setup dự án mới từ scratch"              → /init-project
"Build feature cần cả API + UI"           → /fullstack-feature
"Domain logic phức tạp (lifecycle, calc)"  → /business-logic
"Cần search / filter / pagination"         → /search-filter
"Chỉ thêm API endpoint (không UI)"        → /backend-api
"Chỉ tạo UI page (API đã có)"             → /frontend-ui
"Tạo/sửa database schema"                 → /database
"Implement auth hoặc security"            → /auth-security
"Fix bug"                                  → /fix-bug
"Viết tests"                               → /testing
"Review code"                              → /code-review
"Clean up / refactor"                      → /refactor
"M7: Security + perf + monitoring"         → /harden
"M8: Deploy production"                    → /launch
"Tiếp tục công việc dở"                   → /resume
"Nhiều tasks song song"                   → /orchestrate
```

---

## So sánh: Generic vs Project-Specific

| Generic (SkillSets_List.md) | Project-Specific (file này) | Thay đổi |
|---|---|---|
| — | `/init-project` | ➕ **MỚI** — Greenfield setup |
| `/new-feature` | `/fullstack-feature` | 🔄 **Rename + mở rộng** — BE+FE đồng bộ, API contract |
| — | `/business-logic` | ➕ **MỚI** — Domain logic, state machines |
| — | `/search-filter` | ➕ **MỚI** — Dynamic queries, ILIKE, pagination |
| `/backend-api` | `/backend-api` | ✅ Giữ nguyên |
| `/frontend-ui` | `/frontend-ui` | ✅ Giữ nguyên |
| `/database` | `/database` | ✅ Giữ nguyên |
| `/auth-security` | `/auth-security` | ✅ Giữ nguyên |
| `/fix-bug` | `/fix-bug` | ✅ Giữ nguyên |
| `/testing` | `/testing` | ✅ Giữ nguyên |
| `/code-review` | `/code-review` | ✅ Giữ nguyên |
| `/refactor` | `/refactor` | ✅ Giữ nguyên |
| `/deploy` + `/performance` | `/harden` | 🔄 **GỘP** — M7 cần tất cả cùng lúc |
| `/deploy` | `/launch` | 🔄 **Mở rộng** — thêm UAT, staging, runbook |
| `/resume` | `/resume` | ✅ Giữ nguyên |
| `/orchestrate` | `/orchestrate` | ✅ Giữ nguyên |
| **13 zones** | **16 zones** | +4 mới, 1 gộp, 1 rename |
