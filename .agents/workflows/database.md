---
description: Tạo, chỉnh sửa Tables, viết SQL Migrations độc lập.
---

# /database — Thao tác Database Độc lập

## Khi nào dùng
- Chỉ cần thiết kế Data Schema.
- Viết file Migrations độc lập.
- Thêm table, thêm column, đánh index, viết View hoặc Procedure.

## Pipeline

### Bước 1: Phân tích & EXPLAIN Query
Sử dụng skill `postgresql-patterns`:
- Phác thảo câu query Schema. 
- BẮT BUỘC dùng **MCP Postgres** kết nối database cục bộ, dán query vào chạy, đồng thời chạy lệnh `EXPLAIN ANALYZE` để đo lượng scan ổ cứng (Query Cost) và tốc độ Indexing xem có đủ an toàn không.
// turbo
### Bước 2: Viết mã Migration SQL
Sử dụng skill `postgresql-patterns`:
- Cầm SQL Query đã verify để bỏ vào file `.sql`. Tạo bộ script Up/Down.
// turbo
### Bước 3: Đâm thử Test Data
Sử dụng skill `test-driven-development`:
- Liên tục dùng **MCP Postgres** chạy lệnh `INSERT` dữ liệu lỗi vào DB xem các constraints (UNIQUE, Check constraints, Foreign Key constraint) có nhảy ra báo chặng kịp thời và đúng ý muốn không.
// turbo
### Bước 4: Nghiệm thu
Sử dụng skill `verification-before-completion`:
- Chạy npm run migrate chính thức. Giao hàng.
