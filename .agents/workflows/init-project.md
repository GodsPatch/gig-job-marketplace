---
description: Setup greenfield project từ đầu. Tạo monorepo hoạt động, Docker chạy, CI green, sẵn sàng code. (M1)
---

# /init-project — Khởi tạo dự án từ đầu

## Khi nào dùng
- Greenfield, repo chưa có gì (Milestone 1).
- Cần setup monorepo, tooling, CI/CD, database cơ bản.

## Pipeline

### Bước 1: Quyết định kiến trúc
Sử dụng skill `brainstorming`:
- Confirm tech stack, cấu trúc monorepo (npm workspaces).

### Bước 2: Lên lộ trình triển khai
Sử dụng skill `writing-plans`:
- Plan chi tiết các phase (monorepo → Docker → BE → FE → CI).

### Bước 3: Thực thi tuần tự (Phase-by-Phase)
Sử dụng skill `executing-plans`:
- Tuân thủ thứ tự các công nghệ dưới đây.
// turbo
### Bước 4: Khởi tạo Database Infrastructure
Sử dụng skill `postgresql-patterns`:
- Tạo `docker-compose.yml` chạy Postgres. Viết baseline migration.
// turbo
### Bước 5: Khởi tạo Backend Framework
Sử dụng skill `nodejs-backend-patterns` và `security-best-practices`:
- Setup Express, cấu trúc Clean Architecture, cấu hình CORS, Helmet.
// turbo
### Bước 6: Khởi tạo Frontend Framework
Sử dụng skill `next-best-practices`:
- Setup Next.js App Router.
// turbo
### Bước 7: Cấu hình quy chuẩn chung
Sử dụng skill `typescript-advanced-types`:
- Cấu hình `tsconfig.json` strict mode, path aliases.

### Bước 8: Kiểm chứng Boot
Sử dụng skill `verification-before-completion`:
- Khởi động thử server, frontend, database, xem log không lỗi.
// turbo
### Bước 9: Lưu trữ & Hoàn tất
Sử dụng skill `git-commit` và `finishing-a-development-branch`:
- Tạo commit tổng hợp `chore: project initialization`. Merged.
