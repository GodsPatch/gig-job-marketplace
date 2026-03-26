---
description: Code tính năng xuyên suốt từ DB (Backend) tới UI (Frontend) đảm bảo nhất quán và tuần tự. (M2, M3, M5, M6)
---

# /fullstack-feature — Code Feature Toàn Tập (BE+FE)

## Khi nào dùng
- Feature cần CẢ API endpoint MỚI + frontend pages MỚI đi kèm.
- Bắt buộc tuân thủ nguyên tắc: Thiết kế Database & Backend xong mới chạm vào Frontend.

## Pipeline

### Bước 1: Thiết kế & Lên kế hoạch
Sử dụng skill `brainstorming` và `writing-plans`:
- Design cả BE+FE cùng lúc. Chốt Specs.

### Bước 2: Branching
Sử dụng skill `using-git-worktrees` (tùy chọn):
- Tạo nhánh làm việc độc lập.

### Bước 3: Giao thức API (API Contract)
Sử dụng skill `api-design-principles`:
- Chốt contract JSON Request và Response.
// turbo
### Bước 4: Database Phase
Sử dụng skill `postgresql-patterns`:
- BẮT BUỘC dùng công cụ **MCP Postgres** kết nối thẳng vào database để execute/query thử các lệnh SQL schema mới. Đảm bảo chạy `EXPLAIN` kiểm tra Index trước khi tạo file migrations.
// turbo
### Bước 5: Backend Phase
Sử dụng skill `nodejs-backend-patterns` và `test-driven-development`:
- Viết Controllers, Use cases, Repositories theo TDD. (RED -> GREEN).
// turbo
### Bước 6: Frontend Direction & Logic
Sử dụng skill `frontend-design` và `next-best-practices`:
- Định hướng aesthetic chuyên nghiệp. Code App Router & React Context fetch API.
// turbo
### Bước 7: Styling UI
Sử dụng skill `tailwind-design-system`:
- Làm đẹp giao diện với Tailwind V4, đảm bảo tương thích mobile.

### Bước 8: QA & Phân tích Trình Duyệt Thực tế
Sử dụng skill `webapp-testing` và `web-design-guidelines`:
- BẮT BUỘC dùng công cụ **MCP Playwright** phục vụ Test E2E. Agent phải chạy một trình duyệt tự động, navigate vào trang web, click thử các nút, tự gõ text vào form và cung cấp ít nhất 1 Screenshot cuối cùng.
// turbo
### Bước 9: Bàn giao tổng thể
Sử dụng skill `verification-before-completion`, `requesting-code-review`, và `git-commit`:
- Đảm bảo tất cả test PASS. Tạo Pull Request và Commit incremental.
