---
description: Audit security, tối ưu performance cho Production (M7).
---

# /harden — Gia cố an ninh & Tối ưu hóa

## Khi nào dùng
- Giai đoạn cuối trước khi đưa app ra Production (Milestone M7).
- Cần quét và bít các lỗ hổng bảo mật.
- Cần nén dung lượng, tăng tốc độ load trang.

## Pipeline

### Bước 1: Quét An ninh tổng thể (Security Audit)
Sử dụng skill `security-best-practices`:
- Rà soát CORS, Helmet, Rate Limiter, SQL Injection.
- Cấu hình lại Cookie (Secure, HttpOnly, SameSite).

### Bước 2: Tối ưu Hiện năng (Performance)
Sử dụng skill `performance-optimization`:
- Tối ưu Database Indexing.
- Tối ưu Next.js bundle size, lazy loading, caching Images.
// turbo
### Bước 3: Đảm bảo độ ổn định (Regression)
Sử dụng skill `test-driven-development` và `webapp-testing`:
- Chạy lại toàn bộ test suite và luồng UI test. Việc gia cố KHÔNG được phép làm vỡ các tính năng hiện có.
// turbo
### Bước 4: Nghiệm thu & Cam kết
Sử dụng skill `verification-before-completion`:
- Đảm bảo app vượt qua các tiêu chuẩn Production-ready. Đóng gói.
