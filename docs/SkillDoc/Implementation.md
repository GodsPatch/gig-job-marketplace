# 📝 Theo dõi Tiến độ Triển khai Workflows (SkillSets Zones)

> **Mục đích:** Bảng theo dõi tiến độ tạo 16 file cấu hình Workflow (`.agents/workflows/*.md`) cho dự án Gig Job Marketplace. Bảng này sẽ được update liên tục (đánh dấu `[x]`) sau khi hoàn thành từng phần để anh/chị tiện theo dõi.
> **Lưu ý:** Nếu quá trình bị gián đoạn, anh/chị có thể nhìn vào đây để biết hôm sau cần chạy tiếp từ đâu.

---

## 🚀 Đề xuất Tích hợp Tool MCP (Model Context Protocol)
Để tối đa hóa khả năng tự động và độ chính xác của các workflow này, tôi đề xuất cài đặt/thêm các MCP Servers sau:

1. **`postgres-mcp`**: Thêm năng lực cho `/database`, `/backend-api`, `/search-filter`. Agent có thể tự read schema, chạy EXPLAIN ANALYZE, query trực tiếp db test để verify mà không cần "đoán mò".
2. **`playwright-mcp` (hoặc puppeteer)**: Thêm năng lực cực mạnh cho `/fix-bug`, `/frontend-ui`, `/fullstack-feature`. Agent có thể mở browser ẩn, chụp màn hình UI, click nút, đọc console.log trên browser để bắt chính xác lỗi giao diện.
3. **`github-mcp`**: Dành cho `/code-review`, `/orchestrate`, `/launch`. Giúp Agent tự đọc issue, tự tạo/review Pull Request, check CI status.
4. **`vercel-mcp` / `docker-mcp`**: Cho `/harden` và `/launch`. Giúp kiểm tra logs deployment và container.

*(Anh/chị hãy báo tôi biết nếu muốn cấu hình luôn các MCP này ngay trước khi bắt đầu nhé!)*

---

## 📋 Checklist 16 Workflows Cần Tạo

### Nhóm 1: Greenfield & Features (Cốt lõi)
- [x] 1. `/init-project.md`: Setup dự án từ đầu với monorepo, docker, skeleton.
- [x] 2. `/fullstack-feature.md`: Xây tính năng xuyên suốt từ Frontend đến Backend.
- [x] 3. `/business-logic.md`: Code logic nghiệp vụ thuần tuý, phức tạp.
- [x] 4. `/search-filter.md`: Code query tìm kiếm, filter, pagination, DB index.

### Nhóm 2: Single Layer Development
- [x] 5. `/backend-api.md`: Làm API endpoint độc lập.
- [x] 6. `/frontend-ui.md`: Làm UI page/component độc lập.
- [x] 7. `/database.md`: Chỉnh sửa schema, migration độc lập.
- [x] 8. `/auth-security.md`: Quản lý luồng đăng nhập, bảo mật.

### Nhóm 3: Chất lượng & Bảo trì
- [x] 9. `/fix-bug.md`: Fix bug E2E (rất cần playwright MCP).
- [x] 10. `/testing.md`: Bổ sung Unit test, load test.
- [x] 11. `/code-review.md`: Tool chuẩn bị submit PR.
- [x] 12. `/refactor.md`: Cải thiện code quality.rúc code nợ kỹ thuật.

### Nhóm 4: Production
- [x] 13. `/harden.md`: Audit security, tối ưu performance M7.
- [x] 14. `/launch.md`: Workflow deploy dự án M8.

### Nhóm 5: Meta (Quản lý Agent)
- [x] 15. `/resume.md`: Cấu hình để agent lấy lại context khi bị rớt mạng.
- [x] 16. `/orchestrate.md`: Cấu hình chia task cho Sub-agents.

## 🚀 Bước Tiếp Theo
Sau khi tạo xong 16 Workflows:
1. Đảm bảo file `.agents/workflows/*.md` đã có đủ.
2. Sẵn sàng bắt đầu Milestone 1. Báo User gọi lệnh `/init-project` để thực thi thực tế.

---
*Cập nhật lần cuối: 2026-03-23*
