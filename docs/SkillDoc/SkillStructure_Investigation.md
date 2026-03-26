# 🔬 Kết quả khảo sát cấu trúc thực tế Skills trên skills.sh

> **Mục đích:** Khảo sát cấu trúc file THỰC TẾ của các skill trên skills.sh — trả lời câu hỏi "Mỗi skill chỉ có 1 file SKILL.md hay còn nhiều file khác?"
> **Ngày:** 2026-03-23
> **Kết luận:** Skills KHÔNG chỉ có 1 file. Có 4 loại cấu trúc khác nhau.

---

## 1. Kết quả khảo sát — 5 skills thực tế

### Type A: Chỉ SKILL.md (đơn giản nhất)

**`web-design-guidelines`** — Vercel Labs

```
skills/web-design-guidelines/
└── SKILL.md                    ← Chỉ 1 file duy nhất
```

Toàn bộ instructions, rules, examples đều nằm trong 1 file SKILL.md.

---

### Type B: SKILL.md + tài liệu bổ trợ (multi-file docs)

**`systematic-debugging`** — obra/superpowers

```
skills/systematic-debugging/
├── SKILL.md                    ← File chính (instructions + Iron Law)
├── root-cause-tracing.md       ← Tài liệu bổ trợ: kỹ thuật trace
├── defense-in-depth.md         ← Tài liệu bổ trợ: chiến lược phòng thủ
├── condition-based-waiting.md  ← Tài liệu bổ trợ: kỹ thuật wait
├── condition-based-waiting-example.ts  ← Code mẫu TypeScript
├── find-polluter.sh            ← Script helper (bash)
├── test-pressure-1.md          ← Test scenario 1
├── test-pressure-2.md          ← Test scenario 2
├── test-pressure-3.md          ← Test scenario 3
├── test-academic.md            ← Test academia
└── CREATION-LOG.md             ← Log quá trình tạo skill
```

**Tổng: 11 files.** SKILL.md tham chiếu tới các file .md và .ts/.sh kèm theo.

---

**`test-driven-development`** — obra/superpowers

```
skills/test-driven-development/
├── SKILL.md                    ← File chính (Red-Green-Refactor + Iron Law)
└── testing-anti-patterns.md    ← Tài liệu bổ trợ: anti-patterns
```

**Tổng: 2 files.** SKILL.md reference tới `testing-anti-patterns.md`.

---

### Type C: SKILL.md + rules directory (compiled)

**`react-best-practices`** — Vercel Labs

```
skills/react-best-practices/
├── SKILL.md                    ← File chính (compiled rules OR loader)
├── AGENTS.md                   ← Compiled output = TẤT CẢ rules gộp lại
├── README.md                   ← Hướng dẫn contribute
├── metadata.json               ← Version, organization info
└── rules/                      ← 40+ rule files
    ├── _sections.md            ← Section metadata
    ├── _template.md            ← Template cho rule mới
    ├── async-parallel.md       ← Rule: parallel data fetching
    ├── bundle-dynamic-imports.md ← Rule: dynamic imports
    ├── server-streaming.md     ← Rule: streaming SSR
    ├── client-swr.md           ← Rule: SWR patterns
    ├── rerender-memo.md        ← Rule: React.memo
    └── ... (35+ more rules)
```

**Tổng: ~45+ files.** Có build system (`pnpm build`) compile rules/ → AGENTS.md.

> ⚠️ **Quan trọng:** File `AGENTS.md` là phiên bản compiled — agent đọc file này thay vì đọc từng rule riêng lẻ. Khi cài vào Antigravity, chỉ cần `SKILL.md` + `AGENTS.md` (hoặc copy nội dung AGENTS.md vào SKILL.md).

---

### Type D: SKILL.md + scripts + examples (executable)

**`webapp-testing`** — Anthropic

```
skills/webapp-testing/
├── SKILL.md                    ← File chính (instructions)
├── LICENSE.txt                 ← License
├── scripts/
│   └── with_server.py          ← Python helper: auto start/stop servers
└── examples/
    └── (example test scripts)
```

**Tổng: 4+ files.** Scripts chạy thật — agent execute `with_server.py` khi testing.

---

## 2. Phân loại 27 skills theo cấu trúc

| Type | Mô tả | Skills |
|---|---|---|
| **A** Single file | Chỉ SKILL.md | `web-design-guidelines`, `brainstorming`, `writing-plans`, `executing-plans`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`, `using-git-worktrees`, `dispatching-parallel-agents`, `subagent-driven-development`, `git-commit`, `frontend-design` |
| **B** Multi-file docs | SKILL.md + .md/.ts bổ trợ | `systematic-debugging` (11 files), `test-driven-development` (2 files) |
| **C** Rules directory | SKILL.md + rules/ + AGENTS.md | `react-best-practices` (45+ files), `tailwind-design-system`, `typescript-advanced-types` |
| **D** Scripts + Examples | SKILL.md + scripts/ + examples/ | `webapp-testing` (4+ files) |
| **Custom** Tự viết | SKILL.md (+ tùy chọn) | `api-design-principles`, `nodejs-backend-patterns`, `security-best-practices`, `postgresql-patterns`, `better-auth-best-practices`, `code-refactoring`, `performance-optimization`, `clean-architecture` |

---

## 3. Cách tích hợp vào Antigravity — ĐÃ CẬP NHẬT

### Cấu trúc folder thực tế (updated)

```
.agents/skills/
├── systematic-debugging/           ← Type B: Multi-file
│   ├── SKILL.md                    ← Agent đọc file này đầu tiên
│   ├── root-cause-tracing.md       ← SKILL.md tham chiếu: "Xem root-cause-tracing.md"
│   ├── defense-in-depth.md
│   ├── condition-based-waiting.md
│   ├── condition-based-waiting-example.ts
│   └── find-polluter.sh
│
├── react-best-practices/           ← Type C: Rules
│   └── SKILL.md                    ← Copy nội dung từ AGENTS.md (compiled)
│                                      HOẶC giữ cả folder rules/ nếu muốn
│
├── webapp-testing/                 ← Type D: Scripts
│   ├── SKILL.md
│   ├── scripts/
│   │   └── with_server.py          ← Agent chạy script này khi testing
│   └── examples/
│
├── web-design-guidelines/          ← Type A: Single file
│   └── SKILL.md
│
├── test-driven-development/        ← Type B: 2 files
│   ├── SKILL.md
│   └── testing-anti-patterns.md
│
└── clean-architecture/             ← Custom: tự viết
    └── SKILL.md
```

### Cách Antigravity đọc skills (flow thực tế)

```
1. Agent scan tên + mô tả (YAML frontmatter) của TẤT CẢ SKILL.md
   └── Chỉ đọc phần --- name: ... description: ... --- (rất nhẹ)

2. Nếu skill phù hợp task → Agent đọc TOÀN BỘ nội dung SKILL.md
   └── SKILL.md chứa instructions + reference tới files khác

3. Nếu SKILL.md nói "Xem file X.md để biết thêm" → Agent dùng view_file đọc X.md
   └── Chỉ đọc khi cần, không load tất cả cùng lúc

4. Nếu SKILL.md nói "Chạy script Y.py" → Agent dùng run_command chạy Y.py
   └── Ví dụ: webapp-testing → chạy with_server.py
```

> 💡 **Key insight:** Antigravity đọc SKILL.md là entry point, các file khác được load on-demand qua `view_file` tool. KHÔNG tốn context nếu không cần.

---

## 4. Cách cài skills — 3 phương pháp (CẬP NHẬT)

### Phương pháp 1: `npx skills add` (KHÔNG KHẢ DỤNG hiện tại)

```powershell
npx skills add vercel-labs/agent-skills --skill react-best-practices
```

> ❌ **Lỗi:** `git` không có trong PATH trên máy này → CLI không clone được repo.
> **Fix:** Cài Git for Windows: https://git-scm.com/download/win
> Sau khi cài git, lệnh sẽ hoạt động và tự download toàn bộ folder skill vào dự án.

### Phương pháp 2: Download thủ công từ GitHub (KHUYÊN DÙNG)

```powershell
# Bước 1: Tạo folder
mkdir .agents\skills\systematic-debugging

# Bước 2: Download từng file
# Dùng trình duyệt: GitHub → Raw → Save As
# Hoặc dùng Invoke-WebRequest:

Invoke-WebRequest `
  -Uri "https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md" `
  -OutFile ".agents\skills\systematic-debugging\SKILL.md"

Invoke-WebRequest `
  -Uri "https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/root-cause-tracing.md" `
  -OutFile ".agents\skills\systematic-debugging\root-cause-tracing.md"

# ... tương tự cho các file khác
```

### Phương pháp 3: Clone repo rồi copy folder skill

```powershell
# (Sau khi cài git)
# Clone toàn bộ repo vào thư mục tạm
git clone https://github.com/obra/superpowers.git C:\temp\superpowers

# Copy folder skill cần dùng
xcopy /E /I C:\temp\superpowers\skills\systematic-debugging .agents\skills\systematic-debugging
xcopy /E /I C:\temp\superpowers\skills\test-driven-development .agents\skills\test-driven-development

# Xoá repo tạm
rmdir /S /Q C:\temp\superpowers
```

### Phương pháp đặc biệt cho Type C (rules directory):

Với `react-best-practices` có 45+ files, có 2 lựa chọn:

| Option | Mô tả | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A: Copy AGENTS.md thành SKILL.md** | Chỉ lấy file compiled | 1 file, gọn | Mất khả năng sửa rules riêng lẻ |
| **B: Copy toàn bộ folder** | Lấy cả rules/ + scripts/ | Đầy đủ, có thể customize | 45+ files, nặng hơn |

**Khuyến nghị: Option A** — Copy nội dung `AGENTS.md` (đã compiled) vào `SKILL.md`. Agent chỉ cần 1 file đã đủ.

---

## 5. Tóm tắt

```
Câu hỏi: "Skills chỉ có 1 file SKILL.md?"
Trả lời: KHÔNG. Có 4 loại:

  Type A (13 skills): Chỉ SKILL.md        → Copy 1 file
  Type B (2 skills):  SKILL.md + docs      → Copy cả folder (2-11 files)
  Type C (3 skills):  SKILL.md + rules/    → Copy AGENTS.md compiled (1 file)
  Type D (1 skill):   SKILL.md + scripts/  → Copy cả folder + scripts
  Custom (8 skills):  Tự viết SKILL.md     → 1 file

Antigravity hỗ trợ TẤT CẢ 4 loại:
  - SKILL.md là entry point (bắt buộc)
  - Các file khác được load on-demand bằng view_file
  - Scripts được execute bằng run_command
  - KHÔNG tốn context cho files chưa cần đọc
```
