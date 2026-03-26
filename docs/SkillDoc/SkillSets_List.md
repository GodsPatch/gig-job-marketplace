# 🎯 SkillSets — Nhóm phân vùng kỹ năng khi phát triển dự án

> **Mục đích:** Tổ chức 27 skills thành các **combo skillset** — mỗi combo phục vụ một nhóm bài toán cụ thể khi phát triển dự án. Skills có overlap/conflict được tách vào các combo riêng biệt, đảm bảo không xung đột khi chạy.
>
> **Cách dùng:** Khi agent nhận task, hệ thống xác định task thuộc phân vùng nào → load đúng combo skillset → thực thi theo pipeline đã định nghĩa.
>
> **Tham chiếu:** [ListSkill.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/ListSkill.md) · [SkillConflictAnalysis.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillConflictAnalysis.md)
> **Ngày tạo:** 2026-03-23

---

## Tổng quan các phân vùng

```
┌─────────────────── PHÂN VÙNG KHI PHÁT TRIỂN DỰ ÁN ───────────────────┐
│                                                                        │
│  🏗️  /new-feature         Xây feature mới từ ý tưởng → production     │
│  🐛  /fix-bug              Tìm & sửa bug có hệ thống                  │
│  🎨  /frontend-ui          Design + code giao diện                     │
│  ⚙️  /backend-api          Thiết kế + implement API endpoints          │
│  🗄️  /database             Schema, migrations, queries                 │
│  🔐  /auth-security        Authentication + security hardening         │
│  🧪  /testing              Viết tests (unit, integration, E2E)         │
│  📝  /code-review          Review + nhận feedback code                 │
│  🔄  /refactor             Refactoring + cải thiện code quality        │
│  🚀  /deploy               CI/CD, deployment, monitoring               │
│  ⚡  /performance          Tối ưu hiệu năng                           │
│  ▶️  /resume               Tiếp tục công việc từ checkpoint            │
│  🤖  /orchestrate          Điều phối multi-agent song song             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 🏗️ `/new-feature` — Xây feature mới

> **Khi nào:** Bắt đầu feature hoàn toàn mới, chưa có plan.
> **Mục tiêu:** Từ ý tưởng → code hoàn chỉnh + tested + merged.

### Pipeline

```
brainstorming                      ← Chặn code, buộc design trước
    ↓ (design approved)
writing-plans                      ← Tạo plan bite-sized tasks (TDD order)
    ↓ (plan file created)
using-git-worktrees                ← Tạo branch isolated
    ↓
executing-plans                    ← Thực thi plan tuần tự
    ↓ (per task)
    ├── test-driven-development    ← RED → GREEN → REFACTOR
    ├── typescript-advanced-types   ← Type-safe code
    ├── git-commit                 ← Conventional commit sau mỗi task
    └── verification-before-completion ← Verify trước khi mark done
    ↓ (all tasks done)
requesting-code-review             ← Gửi review có context
    ↓
finishing-a-development-branch     ← Verify all tests, merge/PR
```

### Skills loaded (10)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `brainstorming` | Gate: không code khi chưa có design |
| 2 | `writing-plans` | Tạo plan chi tiết, bite-sized, TDD order |
| 3 | `using-git-worktrees` | Tạo workspace isolated |
| 4 | `executing-plans` | Engine: thực thi plan từng bước |
| 5 | `test-driven-development` | Đảm bảo test-first cho mỗi task |
| 6 | `typescript-advanced-types` | Type safety xuyên suốt |
| 7 | `git-commit` | Conventional commits incremental |
| 8 | `verification-before-completion` | Gate: evidence trước khi claim done |
| 9 | `requesting-code-review` | Gửi review structured |
| 10 | `finishing-a-development-branch` | Hoàn tất branch, merge |

> ⚠️ Combo này dùng `executing-plans` (single agent). Nếu cần multi-agent → dùng `/orchestrate`.

---

## 2. 🐛 `/fix-bug` — Tìm & sửa bug

> **Khi nào:** Nhận report bug, test failure, unexpected behavior.
> **Mục tiêu:** Tìm root cause → fix minimal → prevent regression → verify.

### Pipeline

```
systematic-debugging               ← 4 phases: investigate → analyze → hypothesize → implement
    ↓ Phase 1: Root Cause
    ├── [Backend?] → nodejs-backend-patterns     ← Trace qua middleware, error handlers
    │                 postgresql-patterns          ← EXPLAIN ANALYZE nếu DB-related
    ├── [Frontend?] → vercel-react-best-practices ← Re-render issues, waterfalls
    │                  next-best-practices         ← SSR/CSR/caching issues
    └── typescript-advanced-types                  ← Type errors, inference issues
    ↓ Phase 2-3: Pattern Analysis + Hypothesis
    test-driven-development         ← Write regression test TRƯỚC fix
    ↓ Run test → verify RED (test fails, proving bug exists)
    ↓ Phase 4: Implementation
    [Implement minimal fix]
    ↓ Run test → verify GREEN
    verification-before-completion  ← Chạy FULL test suite, fresh evidence
    ↓
    git-commit                      ← fix: conventional commit
```

### Skills loaded (7-9, tuỳ domain)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `systematic-debugging` | **Core:** 4-phase investigation, Iron Law |
| 2 | `nodejs-backend-patterns` | Trace backend errors (nếu backend bug) |
| 2 | `vercel-react-best-practices` | Trace frontend issues (nếu frontend bug) |
| 3 | `postgresql-patterns` | DB query analysis (nếu DB-related) |
| 3 | `next-best-practices` | SSR/CSR issues (nếu frontend bug) |
| 4 | `typescript-advanced-types` | Type-level debugging |
| 5 | `test-driven-development` | Write regression test TRƯỚC fix |
| 6 | `verification-before-completion` | Verify full suite SAU fix |
| 7 | `git-commit` | Commit `fix:` message |

> ⚠️ **Conflict resolution:** TDD rule "delete code, start over" chỉ áp dụng khi **viết code mới**. Trong fix-bug, `systematic-debugging` ưu tiên hơn (P4 rule). Nếu TDD cycle fail >3 lần → chuyển lại `systematic-debugging`.

---

## 3. 🎨 `/frontend-ui` — Design + code giao diện

> **Khi nào:** Tạo trang mới, component, hoặc redesign UI.
> **Mục tiêu:** UI đẹp, responsive, performant, accessible.

### Pipeline

```
frontend-design                    ← Design thinking: chọn aesthetic direction
    ↓ (aesthetic direction locked)
tailwind-design-system             ← Implement bằng Tailwind theo direction
    ├── next-best-practices        ← App Router: server vs client components
    ├── vercel-react-best-practices ← Performance rules khi code React
    └── typescript-advanced-types   ← Type-safe props, events
    ↓ (UI implemented)
web-design-guidelines              ← AUDIT: compliance check file:line
    ↓ (audit passed)
webapp-testing                     ← E2E: Playwright visual + interaction test
    ↓
verification-before-completion     ← Fresh evidence trước khi claim done
    ↓
git-commit                         ← feat: conventional commit
```

### Skills loaded (8)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `frontend-design` | **Direction:** bold aesthetic, KHÔNG generic |
| 2 | `tailwind-design-system` | **Implementation:** tokens, CVA, responsive |
| 3 | `next-best-practices` | Framework: App Router, SSR/CSR decisions |
| 4 | `vercel-react-best-practices` | Performance: waterfalls, bundle, re-renders |
| 5 | `typescript-advanced-types` | React component types, generics |
| 6 | `web-design-guidelines` | **Audit:** compliance + accessibility check |
| 7 | `webapp-testing` | E2E: Playwright validation |
| 8 | `verification-before-completion` | Gate: evidence trước claim |

> ⚠️ **Overlap resolution:** 3 design skills (14, 15, 17) chạy **tuần tự** theo P5 rule: Direction → Implementation → Audit. Không conflict vì khác giai đoạn.

---

## 4. ⚙️ `/backend-api` — Thiết kế + implement API endpoints

> **Khi nào:** Tạo endpoint mới, thêm middleware, implement business logic.
> **Mục tiêu:** API chuẩn REST, type-safe, validated, tested.

### Pipeline

```
api-design-principles              ← WHAT: resource naming, status codes, pagination
    ↓ (API contract defined)
nodejs-backend-patterns            ← HOW: Express middleware, DI, error handling
    ├── postgresql-patterns        ← Queries: parameterized, joins, transactions
    └── typescript-advanced-types   ← Type-safe DTOs, repository interfaces
    ↓ (per endpoint)
test-driven-development            ← Write API test (Supertest) → implement → verify
    ↓
verification-before-completion     ← Run full backend test suite
    ↓
git-commit                         ← feat: conventional commit
```

### Skills loaded (6)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `api-design-principles` | Contract: REST conventions, response format |
| 2 | `nodejs-backend-patterns` | Implementation: middleware, DI, logging |
| 3 | `postgresql-patterns` | Database: queries, indexes, transactions |
| 4 | `typescript-advanced-types` | Types: DTOs, generics, inference |
| 5 | `test-driven-development` | Test-first: Supertest integration tests |
| 6 | `verification-before-completion` | Gate: verify SAU implement |

> ⚠️ **Overlap resolution:** `api-design-principles` (WHAT) vs `nodejs-backend-patterns` (HOW) — load cả hai nhưng scope đã phân tách rõ. Không conflict.

---

## 5. 🗄️ `/database` — Schema, migrations, queries

> **Khi nào:** Tạo/sửa tables, viết migrations, optimize queries.
> **Mục tiêu:** Schema chuẩn, queries tối ưu, migrations tương thích.

### Pipeline

```
postgresql-patterns                ← NGUỒN SỰ THẬT DUY NHẤT cho database
    ├── Schema design              ← Tables, constraints, indexes
    ├── Migration writing          ← node-pg-migrate, forward-only
    ├── Query building             ← Parameterized, JOINs, CTEs
    └── Performance tuning         ← EXPLAIN ANALYZE, partial indexes
    ↓
test-driven-development            ← Test queries với test database
    ↓
verification-before-completion     ← Run migration + verify schema
    ↓
git-commit                         ← feat/fix: migration commit
```

### Skills loaded (3)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `postgresql-patterns` | **Core:** schema + queries + indexing + migrations |
| 2 | `test-driven-development` | Test queries trước production |
| 3 | `verification-before-completion` | Verify migration success |

> ℹ️ Combo nhỏ nhất. `postgresql-patterns` (merged #19+#23) là nguồn duy nhất — **không có overlap** vì đã gộp.

---

## 6. 🔐 `/auth-security` — Authentication + Security hardening

> **Khi nào:** Implement auth flows (M2) hoặc hardening (M7).
> **Mục tiêu:** Auth an toàn, infra bảo mật, OWASP compliant.

### Pipeline

```
[Auth flow work?]
    better-auth-best-practices     ← NGUỒN SỰ THẬT cho auth logic
        ├── Registration, login, token lifecycle
        ├── Refresh token rotation, reuse detection
        └── Password policies, session management
        ↓
    nodejs-backend-patterns        ← Auth middleware, DI wiring
        ↓
    test-driven-development        ← Test auth flows: register → login → protected

[Infrastructure security work?]
    security-best-practices        ← Helmet, CORS, CSP, rate limiting, OWASP
        ├── npm audit
        ├── Input sanitization
        └── Error message sanitization
        ↓
    verification-before-completion ← Run security checklist + tests
        ↓
    git-commit                     ← feat/fix: security commit
```

### Skills loaded (5)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `better-auth-best-practices` | Auth logic: flows, tokens, sessions |
| 2 | `security-best-practices` ⚡ | Infra security: headers, CORS, OWASP |
| 3 | `nodejs-backend-patterns` | Implementation: middleware, error handling |
| 4 | `test-driven-development` | Test auth flows, security scenarios |
| 5 | `verification-before-completion` | Gate: verify OWASP checklist |

> ⚠️ **Conflict resolution:** `better-auth` (#24) vs `security-best-practices` (#22) — đã thu hẹp scope. Auth logic CHỈ từ #24. Infrastructure CHỈ từ #22. **KHÔNG overlap**. P6 rule enforced.

---

## 7. 🧪 `/testing` — Viết tests chuyên sâu

> **Khi nào:** Viết test suite dedicated (không phải TDD trong feature development).
> **Mục tiêu:** Coverage cao, E2E critical flows, load testing.

### Pipeline

```
[Unit / Integration tests]
    test-driven-development        ← RED-GREEN-REFACTOR discipline
        ├── [Backend] → nodejs-backend-patterns, postgresql-patterns
        └── [Frontend] → vercel-react-best-practices, next-best-practices

[E2E tests]
    webapp-testing                 ← Playwright: with_server.py, reconnaissance
        ├── Screenshot → inspect DOM → identify selectors → execute
        └── Wait for networkidle trước DOM inspection

[Performance tests]
    performance-optimization       ← k6 scripts, p95 targets

    ↓ (all tests written)
verification-before-completion     ← Run ALL test suites, fresh evidence
    ↓
git-commit                         ← test: conventional commit
```

### Skills loaded (5-7, tuỳ scope)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `test-driven-development` | Unit + integration test discipline |
| 2 | `webapp-testing` | E2E: Playwright scripts + server management |
| 3 | `performance-optimization` | Load test scripts, benchmarks |
| 4 | `nodejs-backend-patterns` | Context: backend test setup (nếu BE) |
| 5 | `vercel-react-best-practices` | Context: React testing patterns (nếu FE) |
| 6 | `verification-before-completion` | Gate: toàn bộ suite pass |
| 7 | `git-commit` | Commit `test:` message |

> ℹ️ `tdd` và `webapp-testing` không conflict — TDD cho unit/integration, webapp-testing cho E2E. Khác level, bổ trợ nhau.

---

## 8. 📝 `/code-review` — Review + nhận feedback

> **Khi nào:** Sau feature complete, trước merge, hoặc khi nhận review feedback.
> **Mục tiêu:** Đánh giá chất lượng, đảm bảo standards, xử lý feedback đúng cách.

### Pipeline

```
[Gửi review]
    requesting-code-review         ← Structured: what changed, why, test results
        ↓ (review submitted)

[Nhận feedback]
    receiving-code-review          ← Technical rigor, KHÔNG blind agreement
        ├── Verify feedback trước khi implement
        ├── Investigate nếu feedback unclear
        └── Push back nếu technically questionable
        ↓ (feedback addressed)
    verification-before-completion ← Re-verify SAU khi sửa theo feedback
        ↓
    git-commit                     ← fix/refactor: commit changes
```

### Skills loaded (4)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `requesting-code-review` | Gửi: context, changes, test results, risks |
| 2 | `receiving-code-review` | Nhận: verify feedback, không blind apply |
| 3 | `verification-before-completion` | Gate: re-verify sau changes |
| 4 | `git-commit` | Commit changes from review |

> ℹ️ Hai skill (#11, #12) là **hai mặt của 1 workflow** — request → receive. Không overlap, complementary.

---

## 9. 🔄 `/refactor` — Refactoring + cải thiện code quality

> **Khi nào:** Technical debt tăng, code smells, large files, post-milestone cleanup.
> **Mục tiêu:** Cải thiện structure mà KHÔNG thay đổi behavior.

### Pipeline

```
code-refactoring                   ← Identify smells → plan changes
    ├── typescript-advanced-types   ← Refactor types, improve generics
    ├── [Backend?] → nodejs-backend-patterns ← DI patterns, middleware
    └── [Frontend?] → vercel-react-best-practices ← Component patterns
    ↓ (refactoring plan)
test-driven-development            ← Verify existing tests PASS before + after
    ↓ (refactor with green tests)
verification-before-completion     ← ALL tests still pass = behavior preserved
    ↓
git-commit                         ← refactor: conventional commit
```

### Skills loaded (4-5)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `code-refactoring` | **Core:** smell detection, extract, restructure |
| 2 | `typescript-advanced-types` | Type-level refactoring |
| 3 | `test-driven-development` | Ensure behavior preserved |
| 4 | `verification-before-completion` | Gate: no regressions |
| 5 | `git-commit` | Commit `refactor:` message |

> ⚠️ **Không kết hợp** với `performance-optimization` — refactor giữ behavior, perf thay đổi implementation. Hai mục tiêu khác nhau, chạy ở phases khác nhau.

---

## 10. 🚀 `/deploy` — CI/CD + deployment

> **Khi nào:** Setup CI/CD, deploy production, configure monitoring.
> **Mục tiêu:** Pipeline tự động, deploy stable, rollback sẵn sàng.

### Pipeline

```
using-git-worktrees               ← Setup worktree cho deploy config
    ↓
security-best-practices           ← Audit: npm audit, env vars, secrets
    ↓
[CI/CD pipeline config]
    ├── nodejs-backend-patterns    ← Build, health checks
    ├── postgresql-patterns        ← Production migrations, backup scripts
    └── git-commit                 ← chore: CI/CD config commits
    ↓
verification-before-completion    ← Smoke tests post-deploy
    ↓
finishing-a-development-branch    ← Merge deploy config to main
```

### Skills loaded (6)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `using-git-worktrees` | Isolated workspace cho deploy work |
| 2 | `security-best-practices` | Pre-deploy security audit |
| 3 | `nodejs-backend-patterns` | Build config, health checks |
| 4 | `postgresql-patterns` | Migration scripts, backup procedures |
| 5 | `verification-before-completion` | Post-deploy smoke tests |
| 6 | `finishing-a-development-branch` | Merge to main |

---

## 11. ⚡ `/performance` — Tối ưu hiệu năng

> **Khi nào:** M7 production hardening, performance targets không đạt.
> **Mục tiêu:** p95 <500ms listing, <200ms detail @ 50 concurrent users.

### Pipeline

```
performance-optimization           ← Profile → identify bottlenecks
    ├── [SQL slow?] → postgresql-patterns ← EXPLAIN ANALYZE, index tuning, N+1
    ├── [API slow?] → nodejs-backend-patterns ← Connection pooling, caching, compression
    ├── [FE slow?] → vercel-react-best-practices ← Bundle, waterfalls, re-renders
    └── typescript-advanced-types   ← Type-level optimizations
    ↓ (optimizations applied)
test-driven-development            ← Performance regression test
    ↓
webapp-testing                     ← E2E: verify UX still works after optimization
    ↓
verification-before-completion     ← k6 load test results as evidence
    ↓
git-commit                         ← perf: conventional commit
```

### Skills loaded (6-7)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `performance-optimization` | **Core:** profile, bottlenecks, caching |
| 2 | `postgresql-patterns` | DB: EXPLAIN ANALYZE, indexes |
| 3 | `nodejs-backend-patterns` | API: pooling, compression |
| 4 | `vercel-react-best-practices` | FE: bundle, waterfalls |
| 5 | `test-driven-development` | Regression tests |
| 6 | `verification-before-completion` | Load test evidence |
| 7 | `git-commit` | `perf:` commit |

> ⚠️ **Không kết hợp** với `code-refactoring` — performance có thể inline code (giảm readability cho speed). Hai combo chạy TÁCH BIỆT.

---

## 12. ▶️ `/resume` — Tiếp tục công việc từ checkpoint

> **Khi nào:** Quay lại sau gián đoạn, milestone đang dở, plan có checkpoints [x].
> **Mục tiêu:** Resume chính xác từ điểm dừng, không làm lại phần đã xong.

### Pipeline

```
[Đọc plan file → tìm checkpoint]
    ↓ (xác định task đang dở / task tiếp theo)
executing-plans                    ← Resume từ task chưa checked
    ├── test-driven-development    ← Tiếp tục TDD cho task hiện tại
    ├── typescript-advanced-types   ← Type context
    └── verification-before-completion ← Verify trước khi mark done
    ↓ (task done → next task → ... → all done)
finishing-a-development-branch     ← Hoàn tất branch
```

### Skills loaded (5)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `executing-plans` | Resume engine: read checkpoints, continue |
| 2 | `test-driven-development` | TDD cho remaining tasks |
| 3 | `typescript-advanced-types` | Type context |
| 4 | `verification-before-completion` | Gate per task |
| 5 | `finishing-a-development-branch` | Finish when all done |

> ⚠️ **KHÔNG load** `brainstorming` hay `writing-plans` — plan đã có. P2 rule: nếu plan + checkpoint tồn tại → skip design phase.

---

## 13. 🤖 `/orchestrate` — Multi-agent song song

> **Khi nào:** Milestone lớn, nhiều tasks độc lập, cần tăng tốc.
> **Mục tiêu:** Dispatch agents song song + đảm bảo integration.

### Pipeline

```
brainstorming                      ← Design full milestone
    ↓
writing-plans                      ← Plan with dependency graph
    ↓
dispatching-parallel-agents        ← Identify independent task groups
    ↓
subagent-driven-development        ← Per group: dispatch subagent
    ├── Subagent A (backend) → loads /backend-api combo
    ├── Subagent B (frontend) → loads /frontend-ui combo
    └── Subagent C (database) → loads /database combo
    ↓ (mỗi subagent: implement → spec review → quality review)
    ↓ MERGE all results
verification-before-completion     ← FULL integration test suite
    ├── Không chỉ verify từng phần
    └── Verify toàn bộ TỔNG HỢP
    ↓
finishing-a-development-branch     ← Merge tất cả vào main
```

### Skills loaded (7 cho orchestrator)

| Thứ tự | Skill | Vai trò trong combo |
|:---:|---|---|
| 1 | `brainstorming` | Design milestone |
| 2 | `writing-plans` | Plan với dependency graph |
| 3 | `dispatching-parallel-agents` | Xác định groups song song |
| 4 | `subagent-driven-development` | Dispatch + 2-stage review |
| 5 | `using-git-worktrees` | Isolated workspace per agent |
| 6 | `verification-before-completion` | **FULL integration verify** sau merge |
| 7 | `finishing-a-development-branch` | Merge to main |

> ⚠️ **ASYNC RISK resolved:** Sau khi merge tất cả subagent results → chạy FULL test suite (không chỉ per-part verify). P1 rule.
>
> ⚠️ **KHÔNG load** `executing-plans` — dùng `subagent-driven-development` thay thế. P7 rule.

---

## Ma trận Skill × SkillSet

| Skill | new-feature | fix-bug | frontend | backend | database | auth | testing | review | refactor | deploy | perf | resume | orchestrate |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `brainstorming` | ✅ | · | · | · | · | · | · | · | · | · | · | · | ✅ |
| `writing-plans` | ✅ | · | · | · | · | · | · | · | · | · | · | · | ✅ |
| `executing-plans` | ✅ | · | · | · | · | · | · | · | · | · | · | ✅ | · |
| `subagent-driven` | · | · | · | · | · | · | · | · | · | · | · | · | ✅ |
| `verification` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dispatch-parallel` | · | · | · | · | · | · | · | · | · | · | · | · | ✅ |
| `finishing-branch` | ✅ | · | · | · | · | · | · | · | · | ✅ | · | ✅ | ✅ |
| `tdd` | ✅ | ✅ | · | ✅ | ✅ | ✅ | ✅ | · | ✅ | · | ✅ | ✅ | · |
| `debugging` | · | ✅ | · | · | · | · | · | · | · | · | · | · | · |
| `webapp-testing` | · | · | ✅ | · | · | · | ✅ | · | · | · | ✅ | · | · |
| `request-review` | ✅ | · | · | · | · | · | · | ✅ | · | · | · | · | · |
| `receive-review` | · | · | · | · | · | · | · | ✅ | · | · | · | · | · |
| `react-practices` | · | ✅FE | ✅ | · | · | · | ✅FE | · | ✅FE | · | ✅FE | · | · |
| `frontend-design` | · | · | ✅ | · | · | · | · | · | · | · | · | · | · |
| `web-design-guide` | · | · | ✅ | · | · | · | · | · | · | · | · | · | · |
| `next-practices` | · | ✅FE | ✅ | · | · | · | · | · | · | · | · | · | · |
| `tailwind` | · | · | ✅ | · | · | · | · | · | · | · | · | · | · |
| `typescript` | ✅ | ✅ | ✅ | ✅ | · | · | · | · | ✅ | · | ✅ | ✅ | · |
| `api-design` | · | · | · | ✅ | · | · | · | · | · | · | · | · | · |
| `nodejs-patterns` | · | ✅BE | · | ✅ | · | ✅ | ✅BE | · | ✅BE | ✅ | ✅BE | · | · |
| `security` ⚡ | · | · | · | · | · | ✅ | · | · | · | ✅ | · | · | · |
| `postgresql` | · | ✅DB | · | ✅ | ✅ | · | · | · | · | ✅ | ✅ | · | · |
| `better-auth` | · | · | · | · | · | ✅ | · | · | · | · | · | · | · |
| `refactoring` | · | · | · | · | · | · | · | · | ✅ | · | · | · | · |
| `perf-optim` | · | · | · | · | · | · | ✅ | · | · | · | ✅ | · | · |
| `git-commit` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | · | · |
| `git-worktrees` | ✅ | · | · | · | · | · | · | · | · | ✅ | · | · | ✅ |

---

## Overlap Skills — Được tách vào combos riêng biệt

| Overlap pair | Combo A | Combo B | Lý do tách |
|---|---|---|---|
| `executing-plans` vs `subagent-driven` | `/new-feature`, `/resume` | `/orchestrate` | Alternatives, P7 rule |
| `security` vs `better-auth` | `/deploy` (infra only) | `/auth-security` (auth Logic) | Scope khác, P6 rule |
| `code-refactoring` vs `performance-optimization` | `/refactor` | `/performance` | Mục tiêu khác (structure vs speed) |
| `frontend-design` → `tailwind` → `web-design` | `/frontend-ui` (tuần tự 3 phases) | Không tách — cùng combo, khác giai đoạn | P5 rule |

---

## Quick Reference — Chọn skillset theo tình huống

```
"Tôi muốn build feature X"         → /new-feature
"Có bug cần fix"                    → /fix-bug
"Cần tạo trang/component UI"       → /frontend-ui
"Cần tạo API endpoint"             → /backend-api
"Cần tạo/sửa database"             → /database
"Cần implement auth / security"    → /auth-security
"Cần viết tests"                   → /testing
"Cần review code"                  → /code-review
"Code messy, cần clean up"         → /refactor
"Cần setup CI/CD / deploy"         → /deploy
"App chậm, cần optimize"           → /performance
"Tiếp tục công việc hôm qua"      → /resume
"Milestone lớn, cần song song"    → /orchestrate
```
