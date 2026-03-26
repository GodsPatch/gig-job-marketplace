# 📘 Hướng dẫn Tạo & Sử dụng SkillSets trong Antigravity

> **Mục đích:** Hướng dẫn cách tích hợp skills từ [skills.sh](https://skills.sh/) vào Antigravity, tổ chức thành SkillSets (work zones), và sử dụng cho dự án Gig Job Marketplace.
>
> **Ngày tạo:** 2026-03-23
>
> ⚠️ **CẬP NHẬT:** Skills từ skills.sh có 4 loại cấu trúc file khác nhau (không chỉ 1 file SKILL.md).
> Xem chi tiết tại [SkillStructure_Investigation.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillStructure_Investigation.md)

---

## Mục lục

1. [Kiến trúc Skill trong Antigravity](#1-kiến-trúc-skill-trong-antigravity)
2. [Cách tạo Skill từ skills.sh](#2-cách-tạo-skill-từ-skillssh)
3. [Cách tạo SkillSet (work zone)](#3-cách-tạo-skillset-work-zone)
4. [Minh hoạ thực tế: M3 Job Core](#4-minh-hoạ-thực-tế-m3-job-core)
5. [Quick Reference](#5-quick-reference)

---

## 1. Kiến trúc Skill trong Antigravity

### Antigravity hỗ trợ 2 cơ chế mở rộng:

```
C:\Coding\GodsAgentPatchv0\
├── .agents/                           ← THƯ MỤC GỐC
│   ├── skills/                        ← SKILL = năng lực đơn lẻ
│   │   ├── systematic-debugging/
│   │   │   └── SKILL.md              ← File chính (bắt buộc)
│   │   ├── test-driven-development/
│   │   │   └── SKILL.md
│   │   ├── nodejs-backend-patterns/
│   │   │   ├── SKILL.md
│   │   │   ├── examples/             ← Code mẫu (tuỳ chọn)
│   │   │   └── references/           ← Tài liệu tham khảo (tuỳ chọn)
│   │   └── ...
│   │
│   └── workflows/                     ← WORKFLOW = combo skillset
│       ├── fullstack-feature.md       ← /fullstack-feature
│       ├── fix-bug.md                 ← /fix-bug
│       ├── business-logic.md          ← /business-logic
│       └── ...
```

### Skill vs Workflow — Sự khác biệt

| | Skill | Workflow |
|---|---|---|
| **Là gì** | Module năng lực đơn lẻ | Combo kết nối nhiều skills |
| **File** | `.agents/skills/<name>/SKILL.md` | `.agents/workflows/<name>.md` |
| **Khi nào load** | Agent đọc tên+mô tả → nếu phù hợp → load nội dung | User gọi `/workflow-name` hoặc agent tự nhận diện task type |
| **Ví dụ** | `systematic-debugging` (1 skill) | `/fix-bug` (combo: debugging + TDD + verify) |
| **Tương đương** | 1 cuốn sách hướng dẫn | 1 quy trình làm việc gồm nhiều cuốn sách |

### Cách Antigravity load skills

```
1. Agent nhận task từ user
2. Agent scan TÊN + MÔ TẢ của tất cả SKILL.md (chỉ đọc YAML frontmatter)
3. Nếu skill phù hợp → Agent đọc TOÀN BỘ nội dung SKILL.md
4. Agent thực thi theo instructions trong skill
```

> 💡 **Quan trọng:** Agent KHÔNG load tất cả skills cùng lúc. Nó chỉ load skill khi cần — nhờ vậy context window không bị tràn.

---

## 2. Cách tạo Skill từ skills.sh

### Phương pháp A: Copy thủ công từ GitHub (KHUYÊN DÙNG)

Đây là cách chính xác và kiểm soát nhất.

**Bước 1:** Tìm skill trên [skills.sh](https://skills.sh/), click vào để xem nội dung

**Bước 2:** Tìm link GitHub repo (ví dụ: `obra/superpowers`)

**Bước 3:** Vào GitHub repo, tìm folder skill (ví dụ `skills/systematic-debugging/`)

**Bước 4:** Copy file `SKILL.md` vào project:

```
.agents/skills/systematic-debugging/SKILL.md
```

**Ví dụ thực tế — Tạo skill `systematic-debugging`:**

```powershell
# Bước 1: Tạo folder
mkdir -p .agents/skills/systematic-debugging

# Bước 2: Download SKILL.md từ GitHub
# (hoặc copy nội dung thủ công)
curl -o .agents/skills/systematic-debugging/SKILL.md ^
  https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md
```

### Phương pháp B: Dùng `npx skills` CLI

CLI của skills.sh tự động cài skill vào thư mục agent:

```powershell
cd C:\Coding\GodsAgentPatchv0
npx skills add obra/superpowers --skill systematic-debugging
```

> ⚠️ CLI cài vào `.cursor/skills/` hoặc `.claude/skills/` (tuỳ platform). Cần **move** sang `.agents/skills/` cho Antigravity.

### Phương pháp C: Tự viết skill custom cho dự án

Khi skills.sh không có skill phù hợp (vd: Clean Architecture cho dự án cụ thể), tự viết:

```markdown
# File: .agents/skills/clean-architecture/SKILL.md

---
name: clean-architecture
description: >
  Clean Architecture 4 layers cho dự án Gig Job Marketplace.
  Dùng khi tạo entity, use case, repository, hoặc controller mới.
  Enforce dependency rule: Domain ← Application ← Infrastructure/Interface.
---

# Clean Architecture 4 Layers

## Khi nào dùng
- Tạo entity mới (domain layer)
- Viết use case (application layer)
- Implement repository (infrastructure layer)
- Tạo controller/route (interface layer)

## Dependency Rule (BẮT BUỘC)
```
Domain → KHÔNG import từ layer nào khác
Application → chỉ import từ Domain
Infrastructure → import từ Application + Domain
Interface → import từ Application + Domain
```

## Cấu trúc file
```
apps/api/src/
├── domain/entities/       ← Pure classes, no imports
├── domain/repositories/   ← Interfaces ONLY
├── domain/errors/         ← Domain errors
├── application/use-cases/ ← Business logic
├── application/dtos/      ← Data transfer
├── infrastructure/repos/  ← DB implementations
└── interface/http/        ← Express routes/controllers
```

## Template Entity
```typescript
// domain/entities/[Name].ts
export interface [Name]Props {
  id: string;
  // ... fields
  createdAt: Date;
  updatedAt: Date;
}

export class [Name] {
  private constructor(private readonly props: [Name]Props) {}

  static create(props: Omit<[Name]Props, 'id' | 'createdAt' | 'updatedAt'>): [Name] {
    return new [Name]({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): string { return this.props.id; }
  // ... getters
}
```

## Checklist
- [ ] Domain entity không import từ layer ngoài
- [ ] Use case nhận dependencies qua constructor (DI)
- [ ] Repository interface ở domain, implementation ở infrastructure
- [ ] Controller chỉ gọi use case, không chứa business logic
```

### Format SKILL.md — Cấu trúc chuẩn

```markdown
---
name: skill-name-lowercase            # BẮT BUỘC: tên unique, lowercase, dấu gạch ngang
description: >                         # BẮT BUỘC: mô tả NGẮN khi nào dùng skill này
  Một dòng mô tả rõ ràng skill này làm gì
  và khi nào agent nên load nó.
---

# Tên Skill (human readable)

## Overview
Mô tả ngắn gọn. Agent sẽ announce: "Tôi đang dùng skill X"

## When to Use
- Liệt kê tình huống cụ thể

## The Process / Instructions
Step-by-step agent phải làm gì

## Examples
Ví dụ code/output cụ thể

## Red Flags / Anti-patterns
Những gì KHÔNG được làm

## Checklist
- [ ] Self-verification items
```

---

## 3. Cách tạo SkillSet (Work Zone)

SkillSets được tổ chức dưới dạng **Workflow files** trong `.agents/workflows/`.

### Workflow file format

```markdown
# File: .agents/workflows/fix-bug.md

---
description: Tìm và sửa bug có hệ thống — root cause → regression test → fix → verify
---

# /fix-bug — Quy trình sửa bug

## Khi nào dùng
- Nhận report bug
- Test failure
- Unexpected behavior

## Pipeline

### Bước 1: Xác định phạm vi bug
Xác định bug ở Frontend, Backend, hay Database.

### Bước 2: Systematic Debugging
Sử dụng skill `systematic-debugging`:
- Phase 1: Root Cause Investigation
- Phase 2: Pattern Analysis
- Phase 3: Hypothesis Testing
// turbo
### Bước 3: Viết regression test
Sử dụng skill `test-driven-development`:
- Viết test reproduce bug (phải FAIL — RED)
- Chạy test verify nó FAIL đúng chỗ

### Bước 4: Implement fix
- Fix minimal nhất có thể
- Chạy test → phải PASS (GREEN)
// turbo
### Bước 5: Verify toàn bộ
Sử dụng skill `verification-before-completion`:
- Chạy FULL test suite
- Kiểm tra không có regression
// turbo
### Bước 6: Commit
Sử dụng skill `git-commit`:
- `fix: <mô tả bug đã fix>`
```

> 💡 `// turbo` annotation cho phép auto-run các bước an toàn mà không cần user approval.

### Tạo workflow cho mỗi SkillSet

Theo [SkillSets_List_For_PJ.md](file:///C:/Coding/GodsAgentPatchv0/docs/SkillDoc/SkillSets_List_For_PJ.md), cần tạo 16 workflow files:

| File | Work Zone | Skills kết nối |
|---|---|---|
| `init-project.md` | `/init-project` | brainstorming → writing-plans → executing-plans + 7 tech skills |
| `fullstack-feature.md` | `/fullstack-feature` | brainstorming → plans → DB → BE → FE → review |
| `business-logic.md` | `/business-logic` | brainstorming → domain layer → use case → repository → API |
| `search-filter.md` | `/search-filter` | api-design → postgresql → nodejs → TDD → FE URL sync |
| `backend-api.md` | `/backend-api` | api-design → nodejs → postgresql → TDD → verify |
| `frontend-ui.md` | `/frontend-ui` | design → tailwind → next → react → audit → E2E |
| `database.md` | `/database` | postgresql → TDD → verify |
| `auth-security.md` | `/auth-security` | better-auth → security → nodejs → TDD → verify |
| `fix-bug.md` | `/fix-bug` | debugging → TDD → verify → commit |
| `testing.md` | `/testing` | TDD → webapp-testing → perf → verify |
| `code-review.md` | `/code-review` | request-review → receive-review → verify |
| `refactor.md` | `/refactor` | code-refactoring → TDD → verify → commit |
| `harden.md` | `/harden` | security → perf → TDD → webapp-testing → verify |
| `launch.md` | `/launch` | worktrees → security → webapp-testing → verify |
| `resume.md` | `/resume` | executing-plans → TDD → verify → finish-branch |
| `orchestrate.md` | `/orchestrate` | brainstorming → plans → dispatch → subagent → verify |

---

## 4. Minh hoạ thực tế: M3 Job Core

### Tình huống: Implement Milestone 3 — Job Core Ready

M3 bao gồm:
- Job entity (lifecycle: draft → published → closed)
- Category reference data
- Job CRUD endpoints
- Frontend pages (create, edit, detail, my-jobs)

### Bước 1: Xác định work zones cần dùng

Phân tích M3 tasks:

| Task trong M3 | Work Zone phù hợp |
|---|---|
| Tạo tables `categories`, `jobs` | `/database` |
| Job entity + lifecycle logic | `/business-logic` |
| Category API + Job CRUD API + Job pages | `/fullstack-feature` |
| Search my-jobs (filter by status) | `/search-filter` |

### Bước 2: Execute theo thứ tự

#### Task 3.1: Database schema → Gọi `/database`

```
User: "Tạo migration cho bảng categories và jobs theo M3 spec"
```

Agent sẽ:
1. Load workflow `database.md` → biết pipeline: postgresql → TDD → verify
2. Load skill `postgresql-patterns` → biết: parameterized queries, constraints, indexes
3. Thực hiện:
   - Tạo migration `002_create-categories-table.sql`
   - Tạo migration `003_create-jobs-table.sql`
   - Tạo seed `002_seed-categories.ts` (10 categories)
   - Chạy `npm run migrate:up` → verify tables tạo thành công
   - Commit: `feat: add categories and jobs tables`

#### Task 3.2: Job entity + lifecycle → Gọi `/business-logic`

```
User: "Implement Job entity với lifecycle draft→published→closed theo M3 spec"
```

Agent sẽ:
1. Load workflow `business-logic.md` → biết pipeline: domain → use case → repo → API
2. Load skills: `typescript-advanced-types`, `test-driven-development`, `nodejs-backend-patterns`
3. Thực hiện:

```
[Layer 1: Domain]
├── TDD: viết test Job entity  ← test-driven-development
│   └── test: "Job mới phải ở status draft"
│   └── test: "Chỉ draft mới publish được"
│   └── test: "Chỉ published mới close được"
├── Implement: domain/entities/Job.ts  ← typescript-advanced-types
│   └── class Job { publish(), close() }
│   └── interface IJobRepository
├── Verify: chạy tests → GREEN ✅  ← verification-before-completion

[Layer 2: Application]
├── TDD: viết test CreateJobUseCase
├── Implement: use-cases/CreateJobUseCase.ts
├── Verify: tests pass ✅

[Layer 3: Infrastructure]
├── Implement: repositories/PostgresJobRepository.ts  ← postgresql-patterns
├── Integration test với real DB

[Layer 4: Interface]
├── Implement: routes, controllers  ← api-design-principles
├── Verify: Supertest all endpoints ✅
```

#### Task 3.3: Job CRUD + Frontend pages → Gọi `/fullstack-feature`

```
User: "Implement Job CRUD endpoints và frontend pages (create, edit, detail, my-jobs)"
```

Agent sẽ:
1. Load workflow `fullstack-feature.md` → biết pipeline: DB → BE → FE
2. Load 15 skills (backend + frontend combo)
3. Thực hiện:

```
[Phase 1: Backend - đã có entity từ task 3.2]
├── Routes: POST/PATCH/GET /api/v1/jobs/*
├── Authorization: employer/admin only
├── TDD: Supertest cho mỗi endpoint

[Phase 2: Frontend]
├── frontend-design → chọn aesthetic cho job pages
├── tailwind-design-system → implement components
│   ├── JobForm component (create/edit)
│   ├── JobCard component
│   ├── JobStatusBadge component
│   └── JobActions component (publish/close buttons)
├── next-best-practices → App Router pages
│   ├── /jobs/create/page.tsx
│   ├── /jobs/[slug]/page.tsx
│   ├── /jobs/[slug]/edit/page.tsx
│   └── /my-jobs/page.tsx
├── web-design-guidelines → AUDIT UI compliance
├── webapp-testing → E2E: tạo job → publish → xem detail
```

#### Task 3.4: My-jobs filter → Gọi `/search-filter`

```
User: "Implement filter & pagination cho GET /api/v1/jobs/me"
```

Agent sẽ:
1. Load workflow `search-filter.md`
2. Load skills: `postgresql-patterns`, `api-design-principles`, `next-best-practices`
3. Thực hiện:
   - Dynamic WHERE: filter by status (draft/published/closed)
   - Pagination: page + limit params
   - Frontend: URL sync với searchParams
   - TDD: test filter combinations

### Bước 3: Nếu gặp bug giữa chừng → Gọi `/fix-bug`

```
User: "Job publish endpoint trả 500, không rõ nguyên nhân"
```

Agent sẽ tự chuyển workflow:
1. Load `fix-bug.md` → pipeline: debugging → regression test → fix → verify
2. `systematic-debugging`: investigate 4 phases
3. Tìm root cause (ví dụ: missing status check)
4. TDD: viết regression test → verify RED → fix → verify GREEN
5. Chạy full suite → all pass
6. Commit: `fix: handle missing status check in job publish`

### Bước 4: Kết thúc M3 → Verify toàn bộ

```
User: "M3 xong rồi, verify toàn bộ"
```

Agent load `verification-before-completion`:
1. Chạy `npm run lint` → pass
2. Chạy `npm run typecheck` → pass
3. Chạy `npm test` → all green
4. Chạy `npm run build` → success
5. Curl test tất cả endpoints
6. Claim: "M3 hoàn thành" + evidence

---

## 5. Quick Reference

### Cấu trúc folder cuối cùng

```
C:\Coding\GodsAgentPatchv0\
├── .agents/
│   ├── skills/                        # 27 skills
│   │   ├── brainstorming/SKILL.md
│   │   ├── writing-plans/SKILL.md
│   │   ├── executing-plans/SKILL.md
│   │   ├── test-driven-development/SKILL.md
│   │   ├── systematic-debugging/SKILL.md
│   │   ├── verification-before-completion/SKILL.md
│   │   ├── webapp-testing/SKILL.md
│   │   ├── requesting-code-review/SKILL.md
│   │   ├── receiving-code-review/SKILL.md
│   │   ├── subagent-driven-development/SKILL.md
│   │   ├── dispatching-parallel-agents/SKILL.md
│   │   ├── finishing-a-development-branch/SKILL.md
│   │   ├── using-git-worktrees/SKILL.md
│   │   ├── git-commit/SKILL.md
│   │   ├── vercel-react-best-practices/SKILL.md
│   │   ├── frontend-design/SKILL.md
│   │   ├── web-design-guidelines/SKILL.md
│   │   ├── next-best-practices/SKILL.md
│   │   ├── tailwind-design-system/SKILL.md
│   │   ├── typescript-advanced-types/SKILL.md
│   │   ├── api-design-principles/SKILL.md
│   │   ├── nodejs-backend-patterns/SKILL.md
│   │   ├── postgresql-patterns/SKILL.md
│   │   ├── security-best-practices/SKILL.md
│   │   ├── better-auth-best-practices/SKILL.md
│   │   ├── code-refactoring/SKILL.md
│   │   ├── performance-optimization/SKILL.md
│   │   └── clean-architecture/SKILL.md   # Custom cho dự án
│   │
│   └── workflows/                      # 16 work zones
│       ├── init-project.md
│       ├── fullstack-feature.md
│       ├── business-logic.md
│       ├── search-filter.md
│       ├── backend-api.md
│       ├── frontend-ui.md
│       ├── database.md
│       ├── auth-security.md
│       ├── fix-bug.md
│       ├── testing.md
│       ├── code-review.md
│       ├── refactor.md
│       ├── harden.md
│       ├── launch.md
│       ├── resume.md
│       └── orchestrate.md
│
├── apps/api/                           # Backend
├── apps/web/                           # Frontend
├── packages/shared/                    # Shared
└── docs/SkillDoc/                      # Tài liệu skills
```

### Các lệnh nhanh

```powershell
# Tạo cấu trúc
mkdir .agents\skills .agents\workflows

# Download 1 skill từ obra/superpowers
curl -o .agents/skills/systematic-debugging/SKILL.md ^
  https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md

# Hoặc dùng npx (cần move file sau)
npx skills add obra/superpowers --skill systematic-debugging
```

### Cách gọi workflow

```
# Gọi trực tiếp bằng / command:
User: "/fix-bug — Job publish trả 500"
User: "/fullstack-feature — Implement review system cho M5"
User: "/database — Tạo migration cho bảng leaderboard_snapshots"
User: "/resume — Tiếp tục M3 từ task 3.4"

# Hoặc mô tả task, agent tự nhận diện:
User: "Có bug khi login, token không refresh" → Agent tự load /fix-bug
User: "Implement search jobs với filter" → Agent tự load /search-filter
```

### Từ Milestone → Work Zones

```
Đọc Milestone file
    ↓
Phân tích tasks
    ↓
Map mỗi task → work zone phù hợp
    ↓
Thực thi từng task theo workflow pipeline
    ↓
Verify toàn bộ milestone
```
