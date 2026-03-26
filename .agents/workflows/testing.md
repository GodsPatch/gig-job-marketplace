---
description: Chạy test Unit/E2E toàn diện hoặc Setup môi trường testing.
---

# /testing — Chuyên gia Kiểm thử Toàn diện

## Khi nào dùng
- User yêu cầu "Check xem app có rò rỉ nào không?".
- Cần viết chùm Test bao phủ (Coverage) cho một feature.
- Bắt buộc chạy Playwright tự chụp màn hình UI ứng dụng.

## Pipeline

### Bước 1: Chuẩn bị Kịch bản
Sử dụng skill `test-driven-development`:
- Khám bác sĩ toàn diện mọi edge case. Cắt lớp API, UI.
// turbo
### Bước 2: Triển khai Kịch bản E2E bằng Trình Duyệt Bọc Thép
Sử dụng skill `webapp-testing`:
- BẮT BUỘC phải summon **MCP Playwright** cho các file UI test. Không được giả lập chay ở Backend/Terminal. Playwright sẽ load Page thực, gõ phím giả, submit và quét lỗi React hydrations ở browser level. Screenshot mọi page hỏng.
// turbo
### Bước 3: Validation CSDL & Tốc Độ
Sử dụng skill `postgresql-patterns` và `performance-optimization`:
- Dùng **MCP Postgres** lùng sục database xem các bảng có rò rỉ session hay bị lưu dữ liệu duplicate không sau bài load test E2E vừa rồi.
// turbo
### Bước 4: Validation
Sử dụng skill `verification-before-completion`:
- Dò kết quả và xuất báo cáo Tỷ lệ chênh lệch hoặc Pass/Fail. Đóng gói cho User xem tận mắt Screenshot.
