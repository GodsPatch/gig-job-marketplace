# Implementation Plan - Milestone 2 (User System Ready)

Dựa trên yêu cầu từ `Mileston2PromtForAgent.md`, dưới đây là kế hoạch triển khai chi tiết. 
*(Trạng thái sẽ được cập nhật liên tục thông qua dấu `[x]` sau mỗi bước)*

## Phase 1: Dependencies & Config
- [x] Cài đặt packages: `bcrypt`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit` (và `@types` tương ứng).
- [x] Cập nhật `apps/api/src/infrastructure/config/index.ts` (thêm `REFRESH_TOKEN_SECRET`).
- [x] Cập nhật `apps/api/src/app.ts` (thêm `cookie-parser`).

## Phase 2: Database Migrations
- [x] Tạo file `002_add-user-profile-fields.sql` (phone_number, avatar_url, bio).
- [x] Tạo file `003_create-refresh-tokens-table.sql` (id, user_id, token_hash, expires_at...).
- [x] Chạy migration cập nhật DB.

## Phase 3: Domain Layer
- [x] Cập nhật Entity `User.ts` (Thêm profile fields, factory method, updateProfile).
- [x] Thêm Value Objects: `Email.ts`, `Password.ts`, `UserRole.ts`.
- [x] Thêm Domain Errors: `InvalidCredentialsError.ts`.
- [x] Cập nhật `IUserRepository.ts` (thêm `existsByEmail`).
- [x] Thêm `IRefreshTokenRepository.ts`.

## Phase 4: Application Layer
- [x] Thêm Interfaces: `IPasswordService.ts`, `ITokenService.ts`.
- [x] Cập nhật/Thêm DTOs: `RegisterDTO`, `AuthResponseDTO`, `UpdateProfileDTO`, `UserResponseDTO`.
- [x] Implement Use Cases: `Register`, `Login`, `RefreshToken`, `Logout`, `GetProfile`, `UpdateProfile`.

## Phase 5: Infrastructure Layer
- [x] Implement `BcryptPasswordService.ts`.
- [x] Implement `JwtTokenService.ts`.
- [x] Implement `PostgresUserRepository.ts`.
- [x] Implement `PostgresRefreshTokenRepository.ts`.

## Phase 6: Interface Layer (API)
- [x] Cập nhật Validators: `auth.validators.ts`, `user.validators.ts`.
- [x] Implement Middlewares: `auth.middleware.ts` (Zod validation), `rateLimiter.ts`.
- [x] Implement Controllers: `AuthController.ts`, `UserController.ts`.
- [x] Đăng ký Routes: `auth.routes.ts`, `user.routes.ts`.

## Phase 7: Frontend Auth Infrastructure
- [x] Setup Types: `lib/auth/types.ts`.
- [x] Setup Context: `AuthContext.tsx`, `AuthProvider.tsx`, `useAuth.ts`.
- [x] Cập nhật API Client: Thêm interceptor xử lý 401 và refresh token tự động (`client.ts`).
- [x] Thêm API hooks: `auth.api.ts`.
- [x] Bao bọc `RootLayout` với `AuthProvider`.

## Phase 8: Frontend Pages & Components
- [x] Tạo Shared UI Components: `Button`, `Input`, `FormField`, `Alert`, `LoadingSpinner`.
- [x] Tạo Layouts & Guards: `AuthLayout`, `RouteGuard`, `GuestGuard`.
- [x] Tạo Forms: `LoginForm`, `RegisterForm`, `ProfileEditForm`, `ProfileView`.
- [x] Dựng Pages: `/login`, `/register`, `/dashboard`, `/profile`.
