# 🔍 Phân tích Xung đột & Cộng hưởng giữa các Agent Skills

> **Mục đích:** Rà soát 28 skills trong `ListSkill.md` — phát hiện overlap, conflict, và rủi ro bất đồng bộ khi kết hợp. Đề xuất giải pháp để đảm bảo vận hành trơn tru.
> **Ngày phân tích:** 2026-03-19

---

## I. OVERLAP ZONES — Nhóm skills bị trùng lặp chức năng

### 🔴 OVL-1: `executing-plans` vs `subagent-driven-development`

| Tiêu chí | `executing-plans` | `subagent-driven-development` |
|---|---|---|
| **Chức năng** | Execute plan tuần tự, 1 agent | Execute plan bằng subagents, 2-stage review |
| **Khi nào dùng** | Platform KHÔNG có subagent support | Platform CÓ subagent support |
| **Review** | Tự review | 2-stage: spec reviewer → quality reviewer |

**Vấn đề:** Cả hai đều "execute plan từ file" — nếu agent load cả hai, không biết chọn cái nào.

**Giải pháp:** Đây là **alternatives, không phải complements** (obra/superpowers docs xác nhận điều này). Quy tắc:
- Nếu platform có subagent → dùng `subagent-driven-development` (ưu tiên)
- Nếu không → dùng `executing-plans` (fallback)
- **KHÔNG BAO GIỜ** load cả hai đồng thời cho cùng 1 agent

---

### 🔴 OVL-2: `security-best-practices` vs `better-auth-best-practices`

| Tiêu chí | `security-best-practices` | `better-auth-best-practices` |
|---|---|---|
| **Scope** | Bảo mật tổng thể (OWASP, CORS, CSP, injection...) | Chuyên sâu auth (registration, login, token, session) |
| **JWT** | ✅ Có đề cập | ✅ Chi tiết hơn |
| **Password** | ✅ bcrypt | ✅ policies chi tiết |
| **Token rotation** | ✅ Có | ✅ Chi tiết hơn |

**Vấn đề:** Overlap 60-70% ở phần authentication. Nếu cả hai cùng hướng dẫn JWT implementation nhưng khác chi tiết → agent bối rối.

**Giải pháp:** Phân tách rõ boundary:
- `security-best-practices` = **hạ tầng bảo mật** (headers, CORS, rate limit, injection prevention, npm audit, OWASP checklist). KHÔNG hướng dẫn auth flow cụ thể
- `better-auth-best-practices` = **auth flow chuyên sâu** (registration, login, token lifecycle, session, password policies). Là **nguồn sự thật duy nhất** cho auth
- Khi implement auth → load `better-auth-best-practices`. Khi hardening toàn hệ thống → load `security-best-practices`

---

### 🔴 OVL-3: `supabase-postgres-best-practices` vs `database-schema-design`

| Tiêu chí | `supabase-postgres-best-practices` | `database-schema-design` |
|---|---|---|
| **Schema design** | ✅ Có | ✅ Chuyên sâu |
| **Indexing** | ✅ Có | ✅ Có |
| **Migrations** | ✅ Có | ✅ Có |
| **RLS policies** | ✅ (Supabase-specific) | ❌ |
| **Normalization** | Một phần | ✅ Chi tiết |

**Vấn đề:** Overlap ~50% ở schema design, indexing, migrations. Supabase skill có nội dung Supabase-specific (RLS) không liên quan đến dự án.

**Giải pháp:** Gộp thành 1 skill:
- **Giữ lại:** `database-schema-design` — rename thành `postgresql-patterns`
- **Nội dung:** Merge phần PostgreSQL core từ Supabase skill (query optimization, index strategies) vào
- **Loại bỏ:** Phần Supabase-specific (RLS, Supabase client)
- **Lý do gộp:** Dự án dùng pg driver raw, không dùng Supabase

---

### 🟡 OVL-4: `api-design-principles` vs `nodejs-backend-patterns`

| Tiêu chí | `api-design-principles` | `nodejs-backend-patterns` |
|---|---|---|
| **Error handling** | ✅ Error response format | ✅ Error middleware, error classes |
| **Response format** | ✅ Envelope, status codes | ✅ Response helpers |
| **Validation** | ✅ Input validation principles | ✅ Zod middleware integration |

**Vấn đề:** Overlap nhẹ (~30%) ở error handling và response format. Cả hai đều nói "error format nên thế nào" nhưng từ góc khác.

**Giải pháp:** Phân tách rõ:
- `api-design-principles` = **WHAT** (conventions, naming, status codes, pagination contract)
- `nodejs-backend-patterns` = **HOW** (Express middleware, DI, logging, connection pooling)
- Khi design API → load `api-design-principles` trước. Khi implement → load `nodejs-backend-patterns`

---

### 🟡 OVL-5: `frontend-design` vs `web-design-guidelines` vs `tailwind-design-system`

| Tiêu chí | `frontend-design` | `web-design-guidelines` | `tailwind-design-system` |
|---|---|---|---|
| **Timing** | TRƯỚC khi code (design direction) | SAU khi code (audit) | TRONG KHI code (implementation) |
| **Typography** | ✅ Bold, distinctive | ✅ Compliance | ✅ Token hierarchy |
| **Colors** | ✅ Dominant + accents | ✅ Standards | ✅ CSS variables |
| **Accessibility** | Không focus | ✅ Focus chính | Có basic |

**Vấn đề:** Có overlap nhưng ở các giai đoạn khác nhau. Rủi ro chính: `frontend-design` nói "NEVER use Inter font, be BOLD" nhưng `tailwind-design-system` có thể suggest default Tailwind fonts.

**Giải pháp:** Đã implicit đúng, chỉ cần enforce thứ tự rõ:
1. `frontend-design` → chọn aesthetic direction (TRƯỚC code)
2. `tailwind-design-system` → implement bằng Tailwind theo direction đã chọn (TRONG code)
3. `web-design-guidelines` → audit kết quả (SAU code)
- **Priority rule:** Nếu conflict giữa aesthetic direction và Tailwind defaults → `frontend-design` wins. Customize Tailwind theme cho phù hợp

---

### 🟡 OVL-6: `vercel-react-best-practices` vs `next-best-practices`

| Tiêu chí | `vercel-react-best-practices` | `next-best-practices` |
|---|---|---|
| **Server Components** | ✅ (server-side perf rules) | ✅ (App Router patterns) |
| **Data fetching** | ✅ (client + server rules) | ✅ (SSR/SSG/ISR strategies) |
| **Bundle size** | ✅ (optimization rules) | ✅ (code splitting) |

**Vấn đề:** Overlap ~40% ở server components và data fetching. Cả hai từ Vercel nhưng scope khác.

**Giải pháp:** Cả hai cùng publisher (Vercel Labs), được thiết kế để dùng cùng nhau:
- `vercel-react-best-practices` = **React-level** performance rules (re-renders, bundle, waterfalls)
- `next-best-practices` = **Next.js-level** framework patterns (routing, caching, rendering strategy)
- Không conflict — complementary. Giữ cả hai, load cùng lúc cho Frontend Agent

---

### 🟢 OVL-7: `code-refactoring` vs `performance-optimization`

**Vấn đề:** Refactoring "extract method" có thể thêm function call overhead. Performance "inline" có thể giảm readability.

**Giải pháp:** Không thực sự conflict vì áp dụng ở giai đoạn khác:
- `code-refactoring` → áp dụng trong development (M3-M6, khi technical debt tăng)
- `performance-optimization` → áp dụng khi hardening (M7)
- **KHÔNG bao giờ** chạy cùng lúc trên cùng 1 file

---

## II. CONFLICT SCENARIOS — Xung đột logic khi kết hợp

### ⚠️ CNF-1: `test-driven-development` Iron Law vs `executing-plans` step order

**Mâu thuẫn:**
- TDD nói: "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST — Delete code written before test"
- Executing-plans nói: "Follow each step exactly (plan has bite-sized steps)"
- **Nếu plan viết bước "implement function" TRƯỚC bước "write test" → 2 skills xung đột trực tiếp**

**Giải pháp:** Giải quyết tại nguồn — **`writing-plans` PHẢI** viết plan theo TDD order:
1. Write failing test
2. Run to verify fail
3. Implement minimal code
4. Run tests
5. Commit

`writing-plans` đã enforce điều này (bite-sized steps include TDD). Thêm guard rule: khi `executing-plans` gặp step "implement X" mà chưa có step "write test for X" trước đó → STOP, flag lỗi plan

---

### ⚠️ CNF-2: `brainstorming` hard gate vs existing plan execution

**Mâu thuẫn:**
- Brainstorming nói: "KHÔNG code cho đến khi design được approve — áp dụng cho MỌI project"
- Nhưng khi resume từ checkpoint (e.g., M2 đang dở), agent đã có plan → không cần brainstorm lại

**Giải pháp:** Clarify activation conditions:
- `brainstorming` kích hoạt khi: **chưa có plan** hoặc **bắt đầu feature hoàn toàn mới**
- `executing-plans` kích hoạt khi: **đã có plan file**, resume từ checkpoint
- Guard rule: Nếu plan file tồn tại và có tasks marked `[x]` → skip `brainstorming`, đi thẳng `executing-plans`

---

### ⚠️ CNF-3: `systematic-debugging` vs TDD "delete and start over"

**Mâu thuẫn:**
- TDD nói: "Write code before test? Delete it. Start over. No exceptions"
- Systematic-debugging nói: "Investigate root cause through 4 phases before fixing"
- **Nếu test fail TRONG TDD cycle** → TDD nói "code minimal hơn" nhưng debugging nói "investigate 4 phases"

**Giải pháp:** Phân biệt context kích hoạt:
- **Test fail TRONG TDD RED-GREEN cycle** → TDD rules áp dụng (code đơn giản hơn, không cần 4-phase investigation — vì root cause đã rõ: code chưa đúng)
- **Test fail NGOÀI TDD cycle** (regression, integration, production bug) → `systematic-debugging` áp dụng
- **TDD test fail NHIỀU LẦN liên tiếp** (>3 RED-GREEN attempts thất bại) → chuyển sang `systematic-debugging` vì có vấn đề sâu hơn

---

## III. ASYNC RISKS — Rủi ro bất đồng bộ khi chạy song song

### 🔥 ASYNC-1: `dispatching-parallel-agents` + `verification-before-completion`

**Rủi ro:** Parallel agents complete đồng thời → mỗi agent chạy verification riêng → nhưng khi merge kết quả lại, **integration chưa được verify** (mỗi phần pass riêng nhưng gộp lại fail).

**Giải pháp:**
```
Phase 1: Parallel agents chạy → mỗi agent verify phần mình ✅
Phase 2: SAU KHI merge tất cả → chạy FULL verification suite (tất cả tests) ✅
Phase 3: verification-before-completion áp dụng cho kết quả TỔNG HỢP ✅
```
**Rule:** Parallel work → individual verification → merge → **FULL integration verification** → THEN claim completion

---

### 🔥 ASYNC-2: `subagent-driven-development` + backend/frontend skills conflict

**Rủi ro:** Subagent A (backend, load `api-design-principles`) tạo API response format `{ data: {...} }`. Subagent B (frontend, load `vercel-react-best-practices`) consume API nhưng expect format khác → integration break.

**Giải pháp:**
- **Shared contract:** Cần 1 tài liệu "API Contract" mà TẤT CẢ subagents đều nhận làm context
- **Controller agent** (orchestrator) chịu trách nhiệm: cung cấp API contract cho mỗi subagent
- **Guard:** Spec reviewer trong subagent-driven-development phải verify: output format match contract

---

## IV. ĐỀ XUẤT LOẠI BỎ & GỘP

### Nên loại bỏ / gộp

| Skill | Hành động | Lý do |
|---|---|---|
| `supabase-postgres-best-practices` (#19) | **GỘP vào** `database-schema-design` (#23) | Overlap 50%, Supabase-specific parts không dùng được |
| `executing-plans` (#3) | **GIỮ nhưng đánh dấu FALLBACK** | Là alternative của `subagent-driven-development`, không load cùng lúc |
| `security-best-practices` (#22) | **THU HẸP scope** | Loại bỏ phần auth (đã có `better-auth-best-practices`), chỉ giữ infrastructure security |

### Sau khi gộp: 28 → 27 skills (loại `supabase-postgres-best-practices`)

---

## V. PRIORITY RULES — Quy tắc ưu tiên khi skills xung đột

```
P1 (Iron Law level):
  verification-before-completion > mọi skill khác
  → KHÔNG BAO GIỜ claim done mà chưa verify, bất kể skill nào nói gì

P2 (Process level):
  brainstorming > writing-plans > executing-plans
  → Tuân theo pipeline tuần tự, không nhảy cóc

P3 (Development level):
  test-driven-development > code implementation
  → Test TRƯỚC, code SAU. Nếu plan sai thứ tự → flag lỗi plan

P4 (Debug level):
  systematic-debugging ONLY khi ngoài TDD cycle HOẶC >3 TDD failures
  → Trong TDD cycle, TDD rules ưu tiên

P5 (Design level):
  frontend-design > tailwind-design-system > web-design-guidelines
  → Aesthetic direction → Implementation → Audit

P6 (Auth level):
  better-auth-best-practices > security-best-practices (cho auth topics)
  → Auth logic từ auth-specific skill, security infrastructure từ security skill

P7 (Execution level):
  subagent-driven-development > executing-plans (nếu platform hỗ trợ)
  → subagent-driven là preferred, executing-plans là fallback
```

---

## VI. CỘNG HƯỞNG TÍCH CỰC — Skills bổ trợ nhau tốt

| Combo | Hiệu ứng cộng hưởng |
|---|---|
| `writing-plans` + `test-driven-development` | Plan đã bao gồm TDD steps → executing vừa implement vừa đảm bảo test coverage |
| `systematic-debugging` + `verification-before-completion` | Debug tìm root cause → Fix → Verify fresh → Claim. Tránh "fix done" mà chưa chắc |
| `requesting-code-review` + `receiving-code-review` | Hai mặt review loop: request (structured) → receive (verified). Workflow hoàn chỉnh |
| `brainstorming` + `writing-plans` + `executing-plans` | Pipeline tự nhiên: ý tưởng → plan → thực thi. Không có gap |
| `frontend-design` → `tailwind-design-system` → `web-design-guidelines` | Design → Implement → Audit. 3 giai đoạn không overlap |
| `typescript-advanced-types` + backend/frontend skills | TypeScript là nền tảng, load cùng bất kỳ domain skill nào. Không conflict |
| `git-commit` + `finishing-a-development-branch` | Commit chuẩn xuyên suốt → Branch sạch khi finish. Bổ trợ tự nhiên |

---

## VII. TỔNG KẾT

```
28 skills → phát hiện:
  ├── 7 overlap zones (3 🔴 nghiêm trọng, 3 🟡 nhẹ, 1 🟢 không đáng lo)
  ├── 3 conflict scenarios (tất cả đã có giải pháp priority rules)
  ├── 2 async risks (cần integration verification phase)
  ├── 1 skill nên loại bỏ / gộp (supabase → postgresql-patterns)
  ├── 2 skills cần thu hẹp scope (security, executing-plans)
  └── 7 combos cộng hưởng tích cực

Sau remediation: 27 skills, 0 conflicts, flow tuần tự đảm bảo
```
