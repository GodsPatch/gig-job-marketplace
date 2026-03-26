# 🧠 Agent Skills — Gig Job Marketplace

> **Mục đích:** Danh sách skills cần xây dựng/cài đặt để AI Agent tự động code 100% dự án.
> Mỗi skill được chọn dựa trên **ranking thực tế** từ [skills.sh](https://skills.sh/) leaderboard (89,332+ installs).
>
> **Nguồn tham khảo chính:**
> - [skills.sh](https://skills.sh/) — The Agent Skills Directory (leaderboard, security audits)
> - [obra/superpowers](https://github.com/obra/superpowers) — Top workflow skill suite
> - [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) — Official Vercel skills
> - [anthropics/skills](https://github.com/anthropics/skills) — Official Anthropic skills
> - [wshobson/agents](https://github.com/wshobson/agents) — Full-stack skill collection
>
> **Ngày tạo:** 2026-03-19
> **Phân tích xung đột:** Xem chi tiết tại [SkillConflictAnalysis.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillConflictAnalysis.md)

---

## Cách đọc tài liệu này

- **Rank** = Vị trí trên [skills.sh leaderboard](https://skills.sh/) (All Time)
- **Installs** = Số lượt cài đặt thực tế
- **Publisher** = Tác giả/tổ chức đã xuất bản skill
- Mỗi skill có link trực tiếp tới nội dung gốc trên skills.sh
- Skills được nhóm theo **vùng phân công** khi phát triển dự án

---

## I. WORKFLOW & ORCHESTRATION

> Nhóm skill điều phối quy trình làm việc của agent. Đây là nhóm quan trọng nhất — quyết định **cách agent nghĩ và hành động**, không chỉ code gì.

### 1. `brainstorming`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/brainstorming) |
| **Rank** | #44 · 63.3K installs |
| **Mô tả** | Structured design dialogue — validate ideas TRƯỚC khi implement |
| **Ý nghĩa** | Ngăn agent nhảy vào code mà không suy nghĩ. Enforce 9 bước tuần tự: explore context → clarifying questions → propose approach → present design → document spec → review loop → user sign-off. Hard gate: **KHÔNG code, scaffold, hay implement cho đến khi design được approve** |
| **Áp dụng cho** | Mọi feature mới, mọi milestone, mọi design decision |

### 2. `writing-plans`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/writing-plans) |
| **Rank** | #77 · 33.0K installs |
| **Mô tả** | Viết implementation plans chi tiết với bite-sized tasks |
| **Ý nghĩa** | Tạo plan giả định engineer có **zero context**. Mỗi step là 1 action (2-5 phút): "Write failing test" → "Run to verify fail" → "Implement minimal code" → "Run tests" → "Commit". Bao gồm file structure mapping, scope check, plan header template, DRY/YAGNI/TDD enforcement |
| **Áp dụng cho** | Mỗi milestone (M1-M8), mỗi feature lớn cần plan |

### 3. `executing-plans` ⚠️ FALLBACK
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/executing-plans) |
| **Rank** | #84 · 27.1K installs |
| **Mô tả** | Thực thi plan — load, review critically, execute tuần tự, verify từng bước |
| **Ý nghĩa** | 3-step process: (1) Load & Review—raise concerns trước khi bắt đầu; (2) Execute Tasks—mark in_progress → follow steps → run verifications → mark completed; (3) Complete—use finishing-a-development-branch. **STOP ngay khi gặp blocker**, hỏi thay vì đoán |
| **Áp dụng cho** | Thực thi các Milestone task files (M1-M8) |
| **⚠️ Overlap** | **FALLBACK** cho `subagent-driven-development`. KHÔNG load cả hai đồng thời. Nếu platform có subagent → dùng #4, nếu không → dùng #3 |

### 4. `subagent-driven-development`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/subagent-driven-development) |
| **Rank** | #95 · 22.8K installs |
| **Mô tả** | Dispatch fresh subagent per task + two-stage review (spec compliance → code quality) |
| **Ý nghĩa** | Core orchestration cho multi-agent workflow. Controller agent chỉ coordinate, không code. Mỗi task → subagent riêng (isolated context) → spec reviewer → quality reviewer. Model selection by complexity: cheap models cho 1-2 file tasks, capable models cho architecture/review |
| **Áp dụng cho** | Khi cần nhiều agent làm song song, orchestrate milestone execution |

### 5. `verification-before-completion`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/verification-before-completion) |
| **Rank** | #101 · 21.3K installs |
| **Mô tả** | Evidence before claims, always. No completion claims without fresh verification |
| **Ý nghĩa** | Iron Law: **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**. Gate function: Identify command → Run fresh → Read full output → Verify → THEN claim. Red flags: "should pass", "looks correct", "done!" without running tests. Được rút ra từ 24 failure memories thực tế |
| **Áp dụng cho** | LUÔN — trước mọi claim hoàn thành, mọi commit, mọi PR |

### 6. `dispatching-parallel-agents`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/dispatching-parallel-agents) |
| **Rank** | #127 · 19.6K installs |
| **Mô tả** | Dispatch 2+ independent tasks không có shared state song song |
| **Ý nghĩa** | Tăng tốc development khi có tasks độc lập (vd: backend auth + frontend UI cùng lúc). Xác định dependency graph → isolate independent tasks → dispatch parallel → collect results |
| **Áp dụng cho** | Khi milestone có nhiều tasks không phụ thuộc nhau |

### 7. `finishing-a-development-branch`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/finishing-a-development-branch) |
| **Rank** | #142 · 18.2K installs |
| **Mô tả** | Hoàn tất branch: verify tests → present options → execute merge/PR workflow |
| **Ý nghĩa** | Đảm bảo branch hoàn chỉnh trước khi merge: all tests pass, no regressions, clean commits, proper PR description |
| **Áp dụng cho** | Kết thúc mỗi feature/milestone branch |

---

## II. CODE QUALITY & TESTING

> Nhóm skill đảm bảo chất lượng code. Agent code tốt nhưng cần **kiểm chứng** chất lượng.

### 8. `test-driven-development`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/test-driven-development) |
| **Rank** | #80 · 28.7K installs |
| **Mô tả** | Strict Red-Green-Refactor cycle với Iron Law |
| **Ý nghĩa** | Iron Law: **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST**. Write code before test? Delete it. Start over. No exceptions. Cycle: RED (write failing test) → Verify RED → GREEN (minimal code) → Verify GREEN → REFACTOR → Repeat. Includes anti-patterns list, verification checklist, debugging integration |
| **Áp dụng cho** | Mọi feature mới, bug fix, refactoring trong M1-M8 |

### 9. `systematic-debugging`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/systematic-debugging) |
| **Rank** | #75 · 34.5K installs |
| **Mô tả** | 4-phase debugging: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation |
| **Ý nghĩa** | Iron Law: **NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**. Hoàn thành Phase 1 trước khi đề xuất fix. Red flags: "just one quick fix", multiple failed attempts, time pressure. Đặc biệt quan trọng khi agent bị "loop" sửa lỗi |
| **Áp dụng cho** | Mọi bug, test failure, build error, unexpected behavior |

### 10. `webapp-testing`
| | |
|---|---|
| **Source** | [anthropics/skills](https://skills.sh/anthropics/skills/webapp-testing) |
| **Rank** | #82 · 27.9K installs |
| **Mô tả** | Native Playwright scripts cho testing web apps + server lifecycle management |
| **Ý nghĩa** | Bao gồm `with_server.py` helper (auto start/manage servers), reconnaissance-then-action workflow (screenshot → inspect DOM → identify selectors → execute), wait for `networkidle` trước DOM inspection. Scripts chạy như black-box (run `--help` trước, KHÔNG đọc source) |
| **Áp dụng cho** | E2E testing cho frontend (M2-M8 auth flows, job lifecycle, search...) |

### 11. `requesting-code-review`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/requesting-code-review) |
| **Rank** | #85 · 26.7K installs |
| **Mô tả** | Structured code review request — present changes, context, và test results |
| **Ý nghĩa** | Đảm bảo code review có đủ context: what changed, why, test results, potential risks. Tích hợp với git workflow và subagent-driven-development |
| **Áp dụng cho** | Sau mỗi feature complete, trước every merge |

### 12. `receiving-code-review`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/receiving-code-review) |
| **Rank** | #102 · 21.2K installs |
| **Mô tả** | Xử lý feedback code review — technical rigor, không blind agreement |
| **Ý nghĩa** | Agent phải verify feedback trước khi implement, không performative agreement. Nếu feedback unclear hoặc technically questionable → investigate trước, không blindly apply |
| **Áp dụng cho** | Khi nhận feedback từ reviewer agent hoặc human |

---

## III. FRONTEND DEVELOPMENT

> Nhóm skill cho phát triển giao diện người dùng. Bao gồm design, React patterns, và framework-specific best practices.

### 13. `vercel-react-best-practices`
| | |
|---|---|
| **Source** | [vercel-labs/agent-skills](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) |
| **Rank** | #2 · 226.9K installs 🏆 |
| **Mô tả** | Performance rules by priority: Eliminating Waterfalls → Bundle Size → Server-Side → Client-Side → Re-renders → Rendering → JS Performance → Advanced |
| **Ý nghĩa** | Top #2 toàn cầu. Rules được ưu tiên theo impact: CRITICAL (async waterfalls, bundle size), HIGH (server perf), MEDIUM (client data fetching, re-renders). Áp dụng khi viết React components, data fetching, code review, refactoring, optimize |
| **Áp dụng cho** | Mọi frontend code (M2-M8) |

### 14. `frontend-design`
| | |
|---|---|
| **Source** | [anthropics/skills](https://skills.sh/anthropics/skills/frontend-design) |
| **Rank** | #4 · 176.2K installs 🏆 |
| **Mô tả** | Design thinking + bold aesthetic direction: typography, color, motion, spatial composition |
| **Ý nghĩa** | Enforces: chọn aesthetic direction CỤ THỂ trước khi code (brutally minimal, luxury, editorial...). NEVER generic AI aesthetics (Inter font, purple gradients, cookie-cutter). Focus: distinctive typography, dominant colors + sharp accents, high-impact motion moments, unexpected layouts, atmosphere backgrounds |
| **Áp dụng cho** | Mọi UI design, page layout, component styling |

### 15. `web-design-guidelines`
| | |
|---|---|
| **Source** | [vercel-labs/agent-skills](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) |
| **Rank** | #3 · 180.6K installs 🏆 |
| **Mô tả** | Audit UI code theo Vercel Web Interface Guidelines — design, accessibility, UX compliance |
| **Ý nghĩa** | Fetch latest guidelines từ remote source trước mỗi review. Output `file:line` format. Covers design rules, accessibility standards, UX best practices. Dùng để **audit** UI code SAU khi implement |
| **Áp dụng cho** | Review UI quality cho mọi frontend pages |

### 16. `next-best-practices`
| | |
|---|---|
| **Source** | [vercel-labs/next-skills](https://skills.sh/vercel-labs/next-skills/next-best-practices) |
| **Rank** | #71 · 38.5K installs |
| **Mô tả** | Next.js App Router patterns, Server Components, caching, data fetching, middleware |
| **Ý nghĩa** | Official Vercel skill cho Next.js. Covers: App Router conventions, Server vs Client Components, streaming, route handlers, middleware, caching strategies, static/dynamic rendering decisions |
| **Áp dụng cho** | Mọi Next.js frontend code |

### 17. `tailwind-design-system`
| | |
|---|---|
| **Source** | [wshobson/agents](https://skills.sh/wshobson/agents/tailwind-design-system) |
| **Rank** | #98 · 21.6K installs |
| **Mô tả** | Tailwind v4 design system — tokens, CVA components, compound patterns, responsive grid, dark mode, animations |
| **Ý nghĩa** | Comprehensive: design token hierarchy, 6 component patterns (CVA, compound, form, responsive grid, native CSS animations, dark mode), utility functions, v3→v4 migration checklist, do's/don'ts |
| **Áp dụng cho** | Styling cho mọi frontend components |

### 18. `typescript-advanced-types`
| | |
|---|---|
| **Source** | [wshobson/agents](https://skills.sh/wshobson/agents/typescript-advanced-types) |
| **Rank** | #149 · 16.1K installs |
| **Mô tả** | Advanced TypeScript — generics, conditional types, mapped types, type guards, utility types |
| **Ý nghĩa** | Encode TypeScript expertise: strict mode config, complex generics, inference, template literal types, discriminated unions, module augmentation (Express Request extending). Quan trọng vì toàn bộ dự án là strict TypeScript |
| **Áp dụng cho** | Mọi TypeScript code (cả backend và frontend) |

---

## IV. BACKEND DEVELOPMENT

> Nhóm skill cho phát triển API, database, và server-side logic.

### 19. ~~`supabase-postgres-best-practices`~~ → GỘP vào #23

> ⚠️ **ĐÃ GỘP:** Skill này overlap 50% với `database-schema-design` (#23). Phần PostgreSQL core practices (query optimization, index strategies) đã được merge vào #23 `postgresql-patterns`. Phần Supabase-specific (RLS, Supabase client) bị loại bỏ vì dự án dùng pg driver raw.
> **Tham khảo gốc:** [supabase/agent-skills](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices) — #69 · 40.0K installs

### 20. `api-design-principles`
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) |
| **Rank** | Leaderboard listed |
| **Mô tả** | REST API design — resource naming, HTTP methods, status codes, error formats, versioning, pagination |
| **Ý nghĩa** | Covers: RESTful conventions, consistent response envelope, proper HTTP status codes, pagination patterns (page-based, cursor-based), filtering/sorting conventions, API versioning, HATEOAS considerations. Kết hợp với project-specific patterns (Zod validation, Clean Architecture controllers) |
| **Áp dụng cho** | Mọi API endpoint design (M1-M8) |

### 21. `nodejs-backend-patterns`
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) |
| **Rank** | Leaderboard listed |
| **Mô tả** | Node.js backend patterns — Express middleware, error handling, dependency injection, structured logging |
| **Ý nghĩa** | Covers: Express middleware ordering, async error wrapping, DI patterns (constructor injection), structured JSON logging (Winston), correlation IDs, graceful shutdown, connection pooling, environment config validation. Kết hợp với Clean Architecture layer conventions |
| **Áp dụng cho** | Mọi backend infrastructure code |

### 22. `security-best-practices` ⚡ SCOPED
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) |
| **Rank** | Leaderboard listed |
| **Mô tả** | Infrastructure security — Helmet headers, CORS, CSP, injection prevention, rate limiting, npm audit, OWASP checklist |
| **Ý nghĩa** | Covers: Helmet headers (CSP/HSTS/X-Frame), CORS whitelist, parameterized queries, OWASP Top 10, rate limiting, secrets management, npm audit. **KHÔNG** bao gồm auth flow details (đã có `better-auth-best-practices` #24 cho phần đó) |
| **Áp dụng cho** | API security (M7), production hardening (M7-M8) |
| **⚡ Scope** | Chỉ infrastructure security. Auth flow logic → dùng #24 `better-auth-best-practices` |

### 23. `postgresql-patterns` *(renamed, merged #19)*
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) + [supabase/agent-skills](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices) |
| **Rank** | Leaderboard listed + #69 · 40.0K |
| **Mô tả** | PostgreSQL toàn diện — schema design, raw SQL queries, indexing, migrations, query optimization, transactions |
| **Ý nghĩa** | Merged từ `database-schema-design` + phần PostgreSQL core của `supabase-postgres-best-practices`. Covers: table relationships (1-1, 1-N, N-N junction), constraints (FK, UNIQUE, CHECK), index strategy (B-tree, partial, composite), migration workflow (node-pg-migrate, forward-only), parameterized queries (`$1, $2`), EXPLAIN ANALYZE, JOINs, CTEs, window functions, idempotent seeds. **Nguồn sự thật duy nhất cho mọi database work** |
| **Áp dụng cho** | Schema, migrations, queries, performance tuning (M1-M8) |

### 24. `better-auth-best-practices`
| | |
|---|---|
| **Source** | [better-auth/skills](https://skills.sh/better-auth/skills/better-auth-best-practices) |
| **Rank** | #90 · 24.9K installs |
| **Mô tả** | Authentication system best practices — registration, login, token management, session security |
| **Ý nghĩa** | Từ team Better Auth — chuyên gia auth. Covers: registration flow, login flow, token lifecycle, session management patterns, refresh token rotation, password policies, account recovery. Mặc dù project dùng custom JWT, skills auth fundamentals vẫn áp dụng |
| **Áp dụng cho** | Auth system (M2), security hardening (M7) |

---

## V. CODE QUALITY & REFACTORING

> Nhóm skill cho chất lượng code, refactoring, và performance. Áp dụng xuyên suốt dự án.

### 25. `code-refactoring`
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) |
| **Rank** | Leaderboard listed |
| **Mô tả** | Systematic code refactoring — identify smells, extract, restructure, verify |
| **Ý nghĩa** | Covers: code smell identification, extract method/class, rename, move, inline, replace conditional with polymorphism, break large files, preserve behavior with tests. Đặc biệt cần trong phases sau khi code base lớn |
| **Áp dụng cho** | Technical debt reduction, post-milestone cleanup (M3-M8) |

### 26. `performance-optimization`
| | |
|---|---|
| **Source** | [skills.sh leaderboard](https://skills.sh/) |
| **Rank** | Leaderboard listed |
| **Mô tả** | Performance optimization — profiling, bottleneck identification, caching, query optimization |
| **Ý nghĩa** | Covers: EXPLAIN ANALYZE for SQL, N+1 elimination, connection pooling, caching strategies (in-memory TTL, cache-aside), lazy loading, bundle analysis, response compression. Target: p95 <500ms listing, <200ms detail @ 50 concurrent |
| **Áp dụng cho** | Production hardening (M7), performance targets |

---

## VI. DEVOPS & DEPLOYMENT

> Nhóm skill cho CI/CD, deployment, và monitoring.

### 27. `git-commit`
| | |
|---|---|
| **Source** | [github/awesome-copilot](https://skills.sh/github/awesome-copilot/git-commit) |
| **Rank** | #150 · 15.7K installs |
| **Mô tả** | Conventional commit messages — analyze staged changes, generate semantic commit messages |
| **Ý nghĩa** | Từ GitHub official. Conventional Commits format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Auto-analyze diff để generate message chuẩn. Incremental commits |
| **Áp dụng cho** | Mọi commit trong dự án |

### 28. `using-git-worktrees`
| | |
|---|---|
| **Source** | [obra/superpowers](https://skills.sh/obra/superpowers/using-git-worktrees) |
| **Rank** | #116 · 20.1K installs |
| **Mô tả** | Git worktrees cho isolated development — song song nhiều branches trong cùng repo |
| **Ý nghĩa** | Set up isolated workspace trước khi bắt đầu implement. Cho phép develop features song song, test trên separate branches, không ảnh hưởng nhau |
| **Áp dụng cho** | Multi-agent parallel development, milestone branches |

---

## Tổng hợp

| # | Skill | Publisher | Rank | Installs | Nhóm |
|---|---|---|---|---|---|
| 1 | `brainstorming` | obra/superpowers | #44 | 63.3K | Workflow |
| 2 | `writing-plans` | obra/superpowers | #77 | 33.0K | Workflow |
| 3 | `executing-plans` | obra/superpowers | #84 | 27.1K | Workflow |
| 4 | `subagent-driven-development` | obra/superpowers | #95 | 22.8K | Workflow |
| 5 | `verification-before-completion` | obra/superpowers | #101 | 21.3K | Workflow |
| 6 | `dispatching-parallel-agents` | obra/superpowers | #127 | 19.6K | Workflow |
| 7 | `finishing-a-development-branch` | obra/superpowers | #142 | 18.2K | Workflow |
| 8 | `test-driven-development` | obra/superpowers | #80 | 28.7K | Quality |
| 9 | `systematic-debugging` | obra/superpowers | #75 | 34.5K | Quality |
| 10 | `webapp-testing` | anthropics/skills | #82 | 27.9K | Quality |
| 11 | `requesting-code-review` | obra/superpowers | #85 | 26.7K | Quality |
| 12 | `receiving-code-review` | obra/superpowers | #102 | 21.2K | Quality |
| 13 | `vercel-react-best-practices` | vercel-labs | #2 | 226.9K | Frontend |
| 14 | `frontend-design` | anthropics/skills | #4 | 176.2K | Frontend |
| 15 | `web-design-guidelines` | vercel-labs | #3 | 180.6K | Frontend |
| 16 | `next-best-practices` | vercel-labs | #71 | 38.5K | Frontend |
| 17 | `tailwind-design-system` | wshobson/agents | #98 | 21.6K | Frontend |
| 18 | `typescript-advanced-types` | wshobson/agents | #149 | 16.1K | Frontend |
| ~~19~~ | ~~`supabase-postgres-best-practices`~~ | ~~supabase~~ | ~~#69~~ | ~~40.0K~~ | ~~→ GỘP vào #23~~ |
| 20 | `api-design-principles` | leaderboard | — | — | Backend |
| 21 | `nodejs-backend-patterns` | leaderboard | — | — | Backend |
| 22 | `security-best-practices` ⚡ | leaderboard | — | — | Backend (scope thu hẹp) |
| 23 | `postgresql-patterns` ✨ | leaderboard + supabase | — + #69 | 40.0K | Backend (merged) |
| 24 | `better-auth-best-practices` | better-auth | #90 | 24.9K | Backend |
| 25 | `code-refactoring` | leaderboard | — | — | Quality |
| 26 | `performance-optimization` | leaderboard | — | — | Quality |
| 27 | `git-commit` | github | #150 | 15.7K | DevOps |
| 28 | `using-git-worktrees` | obra/superpowers | #116 | 20.1K | DevOps |

---

## Agent Roles & Loaded Skills

| Agent Role | Top Skills |
|---|---|
| **Orchestrator** | `brainstorming` → `writing-plans` → `subagent-driven-development` → `dispatching-parallel-agents` → `verification-before-completion` → `finishing-a-development-branch` |
| **Backend Developer** | `nodejs-backend-patterns`, `api-design-principles`, `supabase-postgres-best-practices`, `database-schema-design`, `security-best-practices`, `better-auth-best-practices`, `typescript-advanced-types` |
| **Frontend Developer** | `vercel-react-best-practices`, `frontend-design`, `web-design-guidelines`, `next-best-practices`, `tailwind-design-system`, `typescript-advanced-types` |
| **QA / Tester** | `test-driven-development`, `systematic-debugging`, `webapp-testing`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review` |
| **DevOps** | `git-commit`, `using-git-worktrees`, `performance-optimization` |

---

## Workflow Pipeline

```
brainstorming
    ↓ (design approved)
writing-plans
    ↓ (plan created)
executing-plans / subagent-driven-development
    ↓ (per task)
    ├── test-driven-development (RED → GREEN → REFACTOR)
    ├── systematic-debugging (khi gặp lỗi)
    ├── verification-before-completion (trước mọi claim)
    └── requesting-code-review → receiving-code-review
    ↓ (all tasks done)
finishing-a-development-branch
    ↓ (merge/PR)
webapp-testing (E2E validation)
```

---

## Priority Rules — Quy tắc ưu tiên khi skills xung đột

```
P1: verification-before-completion > mọi skill khác
    → LUÔN verify trước khi claim done

P2: brainstorming > writing-plans > executing-plans/subagent-driven
    → Pipeline tuần tự, không nhảy cóc
    → Nếu đã có plan + checkpoint → skip brainstorming

P3: test-driven-development > code implementation
    → Test TRƯỚC, code SAU. Plan phải viết theo TDD order

P4: systematic-debugging chỉ khi NGOÀI TDD cycle HOẶC >3 TDD failures
    → Trong TDD cycle, TDD rules ưu tiên

P5: frontend-design > tailwind-design-system > web-design-guidelines
    → Direction → Implementation → Audit

P6: better-auth-best-practices > security-best-practices (cho auth)
    → Auth skill là nguồn sự thật cho auth. Security skill chỉ cho infrastructure

P7: subagent-driven-development > executing-plans (nếu platform hỗ trợ)
```

> 📋 Chi tiết phân tích: [SkillConflictAnalysis.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillConflictAnalysis.md)

---

## Bước tiếp theo

1. **Cài skills có sẵn**: `npx skills add <repo> --skill <name>` cho các top skills (obra/superpowers, anthropics, vercel-labs)
2. **Custom skills cho project**: Tạo `.agents/skills/<name>/SKILL.md` cho project-specific skills (clean-architecture, domain-driven-design cho dự án này)
3. **Test trên M3**: Chạy pipeline `brainstorming → writing-plans → executing-plans` trên Milestone 3 để validate
4. **Evolve**: Sau mỗi milestone, review kết quả và cải thiện skills
