---
description: Resume công việc đang dở dang ở một branch hoặc task cắt ngang dở.
---

# /resume — Phục hồi Phiên làm việc

## Khi nào dùng
- Bị ngắt quãng giữa chừng vào hôm trước.
- Resume lại Task đang làm dở trên branch.
- Agent quên mất context hiện tại và cần bắt nhịp lại.

## Pipeline

### Bước 1: Đọc lại Lịch sử và Kế hoạch
Sử dụng skill `executing-plans`:
- Mở file markdown kế hoạch gần nhất hoặc đọc file `task.md`.
- Trinh sát xem file nào đang sửa dở dang. Chạy lệnh `git status`.

### Bước 2: Bắt nhịp với Code
Sử dụng skill `test-driven-development`:
- Chạy `npm test` hoặc `npm run dev` để xem hiện tại đang báo lỗi ĐỎ ở đâu, code đang bị kẹt chỗ nào.
// turbo
### Bước 3: Hoàn thành phần còn dở
- Tiếp tục viết code sửa các chỗ ĐỎ thành XANH theo đúng kế hoạch.
// turbo
### Bước 4: Dọn dẹp & Lưu trữ
Sử dụng skill `verification-before-completion` và `finishing-a-development-branch`:
- Hoàn tất công việc, commit tiến độ mới, merged.
