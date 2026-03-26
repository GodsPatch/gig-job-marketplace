---
description: Workflow cuối cùng chuẩn bị Deploy Production (M8).
---

# /launch — Khởi chạy Production

## Khi nào dùng
- Giai đoạn Milestone 8 (M8).
- Chuẩn bị code base, check list để deploy lên nền tảng hosting (Vercel, render, VPS).

## Pipeline

### Bước 1: Môi trường An toàn
Sử dụng skill `using-git-worktrees` (Tùy chọn):
- Cô lập code để thực hiện build test an toàn.

### Bước 2: Kiểm tra cấu hình Production
Sử dụng skill `security-best-practices`:
- Bật cờ `NODE_ENV=production`. Đảm bảo các Token và Secret key đã được cất giấu an toàn, không hardcode.

### Bước 3: Smoke Test toàn diện
Sử dụng skill `webapp-testing`:
- Chạy bản build Production (`npm run build` và `npm run start`).
- Gõ các luồng chính: Đăng ký, Đăng nhập, Tạo Job.
// turbo
### Bước 4: Ký duyệt (Sign-off)
Sử dụng skill `verification-before-completion`:
- In ra Checklist cuối cùng xác nhận System is ready for lift off. Bàn giao cho DevOps.
