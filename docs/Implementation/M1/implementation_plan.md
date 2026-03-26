# Milestone 1: Foundation Ready — Implementation Plan

## Tổng quan

Sau khi phân tích toàn bộ 769 dòng spec trong `Mileston1PromtForAgent.md` và review toàn bộ 40+ file code hiện tại, kết luận rằng **project đã hoàn thành ~95% M1**.

### Đã có đầy đủ:
- ✅ Monorepo npm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- ✅ Backend Clean Architecture 4 layers (domain → application → infrastructure → interface)
- ✅ Domain: `User` entity, `IUserRepository`, `DomainError`, `UserNotFoundError`, `DuplicateEmailError`
- ✅ Application: `RegisterUseCase`, `LoginUseCase`, `RefreshTokenUseCase` stubs + DTOs + `IAuthService`
- ✅ Infrastructure: Config (Zod), Winston Logger, Correlation ID, Database (pg Pool), Sentry, Seeds
- ✅ Interface: Health check, Auth skeleton routes (501), error handler, validation middleware, correlation ID middleware, request logger
- ✅ Frontend: Next.js 14 App Router, Landing page, Login/Register/Dashboard placeholders, Navbar, Error/404/Loading pages, HTTP client, env config
- ✅ Docker Compose PostgreSQL 16
- ✅ Database migration (node-pg-migrate + `001_create-users-table.sql`)
- ✅ CI/CD GitHub Actions (lint, typecheck, test with PG service, build)
- ✅ Backend tests (Supertest: health check, 404, auth 501s)
- ✅ README, .env.example, .env

---

## Proposed Changes

### Chỉ cần sửa 2 issue nhỏ + verify:

---

### Fix Jest Config

#### [MODIFY] `apps/web/jest.config.cjs`

Line 11: `setupFilesAfterSetup` là **tên property sai** — Jest không có property này. Correct name là `setupFilesAfterEnv`:

```diff
-  setupFilesAfterSetup: ['@testing-library/jest-dom'],
+  setupFilesAfterEnv: ['@testing-library/jest-dom'],
```

---

### Frontend Test

#### [NEW] `apps/web/src/__tests__/page.test.tsx`

Thêm render test cơ bản cho HomePage component — đáp ứng requirement M1 Section 13 Output 6: "Ít nhất 1 test frontend (render test)".

Sẽ test:
- Component render thành công
- Tiêu đề "Gig Job Marketplace" hiển thị
- Links "Đăng ký" và "Đăng nhập" có mặt

---

## Verification Plan

### Automated Tests

Chạy tuần tự sau khi apply changes:

```bash
# 1. Lint toàn bộ monorepo
npm run lint

# 2. TypeScript check
npm run typecheck

# 3. Run all tests (BE + FE)
npm test

# 4. Build toàn bộ
npm run build
```

> **Note:** Backend tests yêu cầu PostgreSQL chạy (`docker compose up -d`). Frontend tests chạy với jsdom, không cần DB.

### Manual Verification (M1 Done Checklist)

1. `docker compose up -d` → check `docker compose ps` shows "healthy"
2. `npm run migrate:up -w apps/api`
3. `npm run dev:api` → check server logs on port 4000
4. `curl http://localhost:4000/api/v1/health` → expect 200 + db connected
5. `curl -X POST http://localhost:4000/api/v1/auth/register` → expect 501
6. `curl http://localhost:4000/api/v1/nonexistent` → expect 404 JSON
7. Check response header `X-Correlation-ID` present
8. `npm run dev:web` → check http://localhost:3000 shows landing page
