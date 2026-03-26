---
description: Tìm và sửa bug có hệ thống — root cause → regression test → fix → verify
---

# /fix-bug — Quy trình Cố định Lỗi

## Khi nào dùng
- Nhận report bug từ người dùng hoặc hệ thống monitor.
- Test E2E/Unit test bỗng nhiên failure bất thường.
- Cần giải quyết unexpected behavior trong code.

## Pipeline

### Bước 1: Điều tra bằng Vũ khí hạng nặng
Sử dụng skill `systematic-debugging`:
- Nếu lỗi UI/E2E: BẮT BUỘC dùng **MCP Playwright** điều khiển trình duyệt chạy đúng luồng web lỗi ấy. Thu thập Console Log trên web browser và Screenshot ngay tức khắc.
- Nếu lỗi Database/Chậm/Data sai: BẮT BUỘC dùng **MCP Postgres** kết nối trực tiếp CSDL, select thử các dòng dữ liệu để phát hiện null/rác kịp thời.
// turbo
### Bước 2: Viết Regression Test
Sử dụng skill `test-driven-development`:
- Viết 1 bài Unit/E2E test cố tình gọi vào chỗ bị lỗi. Đảm bảo ĐỎ (FAIL y hệt như logic đang lỗi).
// turbo
### Bước 3: Sát thủ diệt Bug (Fixing)
- Sửa code minimal nhất có thể. Không đập sập cấu trúc cũ.
// turbo
### Bước 4: Nghiệm thu Thực tế
Sử dụng skill `verification-before-completion`:
- Test chuyển qua XANH. Dùng lại **MCP Playwright** để xác nhận UI đã đẹp.
// turbo
### Bước 5: Bàn giao
Sử dụng skill `git-commit`:
- Commit với label chuẩn: `fix: <mô tả bug>`.
