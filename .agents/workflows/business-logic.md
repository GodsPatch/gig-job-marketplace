---
description: Xử lý Domain Logic phức tạp (State transitions, validation rules, gamification) (M3, M5, M6)
---

# /business-logic — Nghiệp vụ Cốt lõi

## Khi nào dùng
- Entity có quy tắc nghiệp chuyển đổi rắc rối (Ví dụ: trạng thái công việc chuyển draft -> published -> closed).
- Các logic tính điểm, kiểm duyệt khó. Không dính líu đến UI.

## Pipeline

### Bước 1: Định nghĩa Domain (Test-first)
Sử dụng skill `brainstorming`, `typescript-advanced-types`, và `test-driven-development`:
- Clarify quy tắc. 
- Định hình Type Interface (Entity props).
- Viết Unit test TRƯỚC CẢ KHI implement class logic. (RED).
// turbo
### Bước 2: Code Domain Layer
Sử dụng skill `nodejs-backend-patterns`:
- Code Class Entity và Value Objects cho tới khi GREEN cái Unit Test ở bước 1.
// turbo
### Bước 3: Application (Use Cases)
Sử dụng skill `test-driven-development` và `nodejs-backend-patterns`:
- Viết test Use Case với mocked Repositories. Pass 100%.
// turbo
### Bước 4: Infrastructure
Sử dụng skill `postgresql-patterns`:
- Viết Repositories kết nối DB thực, viết queries.
// turbo
### Bước 5: Interface (Khớp API)
Sử dụng skill `api-design-principles`:
- Map các Use Cases và Entities này ra REST Controllers để gọi được.
// turbo
### Bước 6: Nghiệm thu Core
Sử dụng skill `verification-before-completion` và `git-commit`:
- Đảm bảo Terminal All Pass. Lưu trạng thái.
