---
description: Search, filter tĩnh/động, sort, pagination bằng SQL Indexes & url synced cho UI. (M4, M5)
---

# /search-filter — Lọc và Tìm Kiếm Nâng Cao

## Khi nào dùng
- Làm chức năng Query động nhiều tiêu chí.
- Lọc giá, category, keyword tìm kiếm.
- Yêu cầu query an toàn (ESCAPED) và hiệu suất cao.

## Pipeline

### Bước 1: Giao thức (Contract)
Sử dụng skill `api-design-principles`:
- Thiết kế Pagination contract rõ ràng (page, limit, sort, các filter).
// turbo
### Bước 2: Database Layer
Sử dụng skill `postgresql-patterns`:
- Sử dụng Parameterized Query với `$1, $2` tránh injection và ILIKE an toàn.
- Cân nhắc `EXPLAIN ANALYZE` và đánh Composite/Partial index nếu volume lớn.
// turbo
### Bước 3: Xử lý logic Backend
Sử dụng skill `nodejs-backend-patterns` và `test-driven-development`:
- Xây dựng Dynamic Query Builder Utility.
- TDD đa trường hợp (có mix params).
// turbo
### Bước 4: Đồng bộ trạng thái UI (URL Params)
Sử dụng skill `next-best-practices` và `vercel-react-best-practices`:
- Đọc `searchParams`, Sync state giao diện với thanh Address Bar.
- Áp dụng kỹ thuật "Debounce" tránh request spam lên Backend.
// turbo
### Bước 5: Hoàn thiện Component
Sử dụng skill `tailwind-design-system`:
- Xây dựng thanh Filter Sidebar hoặc Search input UI.
// turbo
### Bước 6: Test Hiệu Năng
Sử dụng skill `verification-before-completion`, `performance-optimization` và `git-commit`:
- Đo đạc test danh sách phải về dứơi ngưỡng p95 < 500ms. Commit.
