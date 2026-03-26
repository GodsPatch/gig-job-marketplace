---
description: Quản lý và uỷ quyền task cho các AI Sub-agents (Nếu Antigravity hỗ trợ tính năng chia nhỏ).
---

# /orchestrate — Quản lý Agent Đa Chiều

## Khi nào dùng
- Task quá to, vượt quá token limit hoặc context window.
- Cần spawn ra nhiều AI phụ tùng (Sub-agents) để làm các component khác nhau cùng lúc.

## Pipeline

### Bước 1: Phân rã Hệ thống
Sử dụng skill `brainstorming` và `writing-plans`:
- Nhìn vào tổng thể tính năng. Chia tách nó thành 3-4 component hoàn toàn độc lập với nhau (Không share state).

### Bước 2: Điều phối Sub-Agent
Sử dụng skill `dispatching-parallel-agents` và `subagent-driven-development`:
- Setup task rõ ràng cho từng Agent phụ. Cấp quyền vào từng folder cụ thể.

### Bước 3: Nghiệm thu tập thể
Sử dụng skill `verification-before-completion`:
- Lắp ráp các sản phẩm lại với nhau. Verify luồng chạy tổng thể. Bàn giao.
