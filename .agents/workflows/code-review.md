---
description: Hỗ trợ review code (chuẩn bị mở PR) hoặc đóng vai trò Reviewer nhận xét code người khác.
---

# /code-review — Kiểm duyệt Code

## Khi nào dùng
- Làm xong Task to, chuẩn bị gửi Pull Request lên Git.
- (Hoặc) Cần Agent đóng vai Senior Dev để săm soi kỹ một đoạn hỏng hóc.

## Pipeline

### Bước 1: Khi cần Xin Review
Sử dụng skill `requesting-code-review`:
- Chạy self-review trước vòng một.
- Ghi lại các điểm nguy hiểm hoặc phức tạp để người đọc dễ theo dõi.

### Bước 2: Khi đóng vai Nhận Review Code
Sử dụng skill `receiving-code-review`:
- Cực kỳ khắt khe: Săm soi khả năng SQL Injection, XSS, N+1 Query.
- Tìm các dòng code vi phạm Clean Architecture.

### Bước 3: Tổng Hợp & Đánh Giá
Sử dụng skill `verification-before-completion`:
- Chốt lại những chỗ cần Optimize. Nếu pass thì tự động ghi nhận LGTM (Looks Good To Me).
