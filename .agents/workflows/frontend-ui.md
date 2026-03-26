---
description: Làm UI page hoặc component độc lập (React/Next). API đã có sẵn.
---

# /frontend-ui — Code Frontend Độc lập

## Khi nào dùng
- Chỉ tạo hoặc sửa trang UI.
- Viết các component dùng chung (Button, Card).
- Backend API để gọi đã tồn tại sẵn, không cần sửa đổi thêm phía Backend.

## Pipeline

### Bước 1: Xác định Vibe Thiết kế
Sử dụng skill `frontend-design`:
- Quyết định tông màu, bố cục, khoảng cách hiện đại. Xóa bỏ UI nhàm chán.
// turbo
### Bước 2: Cơ sở Type Data
Sử dụng skill `typescript-advanced-types`:
- Interface Props cho UI Component, Response Type từ Backend.
// turbo
### Bước 3: Setup Cơ chế Render Flow
Sử dụng skill `next-best-practices` và `vercel-react-best-practices`:
- Quyết định nên làm Server Component hay Client Component.
- Tối ưu fetch state, loading suspense.
// turbo
### Bước 4: Component & Styling
Sử dụng skill `tailwind-design-system`:
- Xây UI với Tailwind V4. Bố trí component theo module.
// turbo
### Bước 5: Review Trải nghiệm (Web Guideline)
Sử dụng skill `web-design-guidelines`:
- Tự review lỗi UX, contrast và accessibility.
// turbo
### Bước 6: End-To-End (QA test)
Sử dụng skill `webapp-testing` và `verification-before-completion`:
- BẮT BUỘC dùng **MCP Playwright** điều khiển trình duyệt truy cập vào View vừa code. Click và tương tác xem có giật lag hay lệch layout không. Chụp lại Screenshot báo cáo User. KHÔNG nghiệm thu mù mờ.
