---
description: Tái cấu trúc code (Refactor) cho sạch đẹp, không làm thay đổi Logic.
---

# /refactor — Tái cấu trúc Code

## Khi nào dùng
- Một File hoặc Hàm (Function) trở nên quá to và lằng nhằng (Spaghetti code).
- Biến đổi từ kiến trúc cũ sang Clean Architecture, gom trùng lặp code.

## Pipeline

### Bước 1: Gắn chốt bảo hiểm
Sử dụng skill `test-driven-development`:
- Chạy Unit test hiện tại ĐẢM BẢO NÓ ĐANG GREEN. Nếu nó RED thì không được refactor. Phải fix bug trước.
// turbo
### Bước 2: Chỉnh hình Code
Sử dụng skill `code-refactoring`:
- Cắt hàm to thành hàm nhỏ (Extract Function). Đổi tên cho tường minh. 
- Diệt "God class", nới lỏng coupling bằng Dependency Injection.
// turbo
### Bước 3: Regression Test 
Sử dụng skill `verification-before-completion`:
- Chạy LẠI bộ test. Mọi thứ GIAO DIỆN VÀ API phải giữ nguyên y xì 100%, không sai khác dù chỉ 1 milimet.

### Bước 4: Bàn giao 
Sử dụng skill `git-commit`:
- Lưu với format: `refactor: <mô tả>`.
