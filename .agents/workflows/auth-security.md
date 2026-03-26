---
description: Xây dựng hoặc bảo trì quy trình đăng nhập, đăng ký, uỷ quyền bảo mật, sessions.
---

# /auth-security — Bảo mật Hệ thống & Authentication

## Khi nào dùng
- Dev phase M2 (Auth System).
- Fix lỗi liên quan đến Token, Login session.
- Fix các lỗ hổng bảo mật CORS, CSRF, Access Control.

## Pipeline

### Bước 1: Triển khai Thư viện Auth
Sử dụng skill `better-auth-best-practices`:
- Thiết lập core logic session/token auth. Setup config adapters.
// turbo
### Bước 2: Bảo mật Đường truyền Express
Sử dụng skill `security-best-practices` và `nodejs-backend-patterns`:
- Bọc Rate limit, Helmet Security headers, config Caching chặn DDOS.
- Code Auth Middleware kiểm tra Authorization JWT/Session.
// turbo
### Bước 3: TDD Chống hack
Sử dụng skill `test-driven-development`:
- Test tấn công Brute force Login. Test request không có Session Cookie.
- Test vượt quyền (Worker cướp quyền Admin). Test yêu cầu tất cả phải bị chặn đỏ mặt (RED -> GREEN fix).
// turbo
### Bước 4: Rà soát & Bàn giao
Sử dụng skill `verification-before-completion`:
- Xác nhận các route được bảo vệ tốt. Commit.
