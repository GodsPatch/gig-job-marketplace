---
description: Làm API endpoint độc lập. Chỉ thêm API endpoint ở Backend (không tạo UI page mới).
---

# /backend-api — Làm Endpoint API độc lập

## Khi nào dùng
- Backend cần có thêm endpoint độc lập xử lý một công việc cụ thể.
- Đã có Frontend, chỉ cần cung cấp thêm dữ liệu.

## Pipeline

### Bước 1: Giao thức & Contract
Sử dụng skill `api-design-principles`:
- Định nghĩa Request URL, Request/Response DTO.
// turbo
### Bước 2: Cấp type Interface
Sử dụng skill `typescript-advanced-types`:
- Định nghĩa Interface Types tại Shared thư mục nếu cần.
// turbo
### Bước 3: Data Layer & Phân tích Query
Sử dụng skill `postgresql-patterns`:
- BẮT BUỘC lôi **MCP Postgres** ra để phác thảo câu query thô, chạy thử `EXPLAIN ANALYZE` trực tiếp trên DB để đánh giá tốc độ/Query Cost trước khi ghép vào code Repository.
// turbo
### Bước 4: Application Layer (TDD)
Sử dụng skill `test-driven-development` và `nodejs-backend-patterns`:
- Viết Unit/Integration Test cho Use Case + Controller. Mở đường code lấy GREEN.
- Code Route.
// turbo
### Bước 5: Bàn giao Endpoint
Sử dụng skill `verification-before-completion`:
- Chạy Curl hoặc npm test để chứng minh endpoint return data đúng format như thiết kế.
