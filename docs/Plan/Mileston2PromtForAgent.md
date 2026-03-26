# Implementation Prompt — Milestone 2: User System Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M2 – User System Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M2

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 2 (User System Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- M1 – Foundation Ready ✅ (ĐÃ XONG)
- **M2 – User System Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M3 – Job Core Ready (CRUD job, publish/close)
- M4 – Discovery Ready (search, filter, homepage)
- M5 – Marketplace Ready (worker listing, review)
- M6 – Gamification Ready
- M7 – Production Ready
- M8 – Launch

### Những gì M1 đã cung cấp (bạn kế thừa)
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`
- Backend Express + TypeScript, cấu trúc Clean Architecture 4 layers
- Frontend Next.js 14+ App Router + TypeScript + Tailwind CSS
- PostgreSQL 16 chạy Docker Compose
- node-pg-migrate đã configured, baseline migration tạo bảng `users`
- Auth skeleton: User entity, IUserRepository, use case stubs (trả 501), route placeholders, auth middleware skeleton
- Winston structured logging + correlation ID
- Sentry error tracking cơ bản
- Global error handling + custom error classes (AppError, NotFoundError, ValidationError, UnauthorizedError)
- Zod validation middleware
- Config management type-safe
- GitHub Actions CI pipeline
- Health check GET `/api/v1/health`

### Bảng `users` hiện tại từ M1
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'worker',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 2. TECH STACK BẮT BUỘC

- **Frontend**: Next.js 14+ (App Router), React, TypeScript strict, Tailwind CSS v3
- **Backend**: Node.js 20, Express.js, TypeScript strict
- **Database**: PostgreSQL 16 (pg driver trực tiếp, KHÔNG ORM)
- **Architecture**: Clean Architecture 4 layers, DDD, REST API
- **Monorepo**: npm workspaces
- **Migration**: node-pg-migrate
- **Validation**: Zod
- **Logging**: Winston (đã có từ M1)
- **Error Tracking**: Sentry (đã có từ M1)
- **Testing**: Jest + Supertest (BE), Jest + React Testing Library (FE)
- **Password hashing**: bcrypt (cost factor 12)
- **Token**: JWT (jsonwebtoken package)
- **API prefix**: `/api/v1/`

### Ràng buộc kiến trúc backend (giữ nguyên từ M1)
```
apps/api/src/
├── domain/          # Entities, Value Objects, Repository Interfaces, Domain Errors
├── application/     # Use Cases, DTOs, Port Interfaces
├── infrastructure/  # DB, Logging, Config, Repositories Implementation, Services
├── interface/       # HTTP Routes, Controllers, Middlewares, Validators
├── shared/          # Constants, Utils
├── app.ts
└── server.ts
```
**Dependency rule**: Domain ← Application ← Infrastructure/Interface. Domain KHÔNG import từ layer ngoài.

---

## 3. MỤC TIÊU MILESTONE M2

Xây dựng hệ thống người dùng hoàn chỉnh:

1. **Đăng ký** user mới với validation
2. **Đăng nhập** trả access token + refresh token
3. **Refresh token** gia hạn phiên an toàn
4. **Đăng xuất** invalidate refresh token
5. **Xem profile** của chính mình
6. **Cập nhật profile** cơ bản
7. **Route guard** frontend chặn truy cập trái phép
8. **Auth state management** frontend
9. **Bảo mật** cơ bản production-grade

---

## 4. QUYẾT ĐỊNH KỸ THUẬT ĐÃ CHỐT

Các quyết định sau đã được chốt bởi Solution Architect. Bạn PHẢI tuân theo, không thay đổi:

### 4.1 Token Strategy

| Hạng mục | Quyết định |
|---|---|
| **Access Token** | JWT, HS256, expire 15 phút, gửi qua `Authorization: Bearer <token>` header |
| **Refresh Token** | Random string (crypto.randomBytes), expire 7 ngày, lưu DB, gửi qua httpOnly secure cookie |
| **Refresh Token Rotation** | CÓ — mỗi lần refresh tạo token mới, invalidate token cũ |
| **Token Reuse Detection** | Nếu refresh token đã bị invalidate mà được dùng lại → revoke TẤT CẢ tokens của user đó (bảo vệ trường hợp token bị đánh cắp) |

### 4.2 Password Security

| Hạng mục | Quyết định |
|---|---|
| **Algorithm** | bcrypt, cost factor 12 |
| **Validation** | Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số |
| **Lưu trữ** | Chỉ lưu hash, KHÔNG BAO GIỜ log hay trả password trong response |

### 4.3 Security Policies

| Hạng mục | Quyết định |
|---|---|
| **Rate limiting** | Có — giới hạn login/register requests (ví dụ: 5 requests/phút/IP cho login, 3/phút/IP cho register) |
| **Error messages** | Không tiết lộ email đã tồn tại khi login thất bại. Dùng message chung: "Email hoặc mật khẩu không đúng" |
| **Register** | CÓ trả lỗi nếu email đã tồn tại (vì cần UX rõ ràng khi đăng ký) |
| **Logout** | Xóa refresh token khỏi DB + clear cookie |
| **CORS** | Configured cho frontend origin |
| **Cookie** | httpOnly, secure (trong production), sameSite: strict, path: /api/v1/auth |

### 4.4 User Roles

| Role | Mô tả |
|---|---|
| `worker` | Người tìm việc (default khi đăng ký) |
| `employer` | Người đăng tuyển |
| `admin` | Quản trị viên (KHÔNG tạo qua register, chỉ seed) |

### 4.5 Frontend Auth State

| Hạng mục | Quyết định |
|---|---|
| **State management** | React Context + useReducer (AuthContext) |
| **Access token storage** | In-memory (biến trong context, KHÔNG localStorage) |
| **Refresh** | Tự động gọi `/auth/refresh` khi access token hết hạn (interceptor trong HTTP client) |
| **Persist login** | Khi load page, gọi `/auth/refresh` (cookie tự gửi) → nếu thành công thì user đã login |
| **Route guard** | Middleware hoặc HOC/wrapper component kiểm tra auth state |

---

## 5. DATABASE CHANGES CẦN TRIỂN KHAI

### 5.1 Migration: Mở rộng bảng `users`

Bổ sung thêm fields nếu cần (hoặc giữ nguyên nếu schema M1 đã đủ). Cần đảm bảo có:
- `phone_number VARCHAR(20)` (optional, cho profile)
- `avatar_url VARCHAR(500)` (optional, cho profile)
- `bio TEXT` (optional, mô tả ngắn)

```sql
-- Migration: 002_add-user-profile-fields.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
```

### 5.2 Migration: Tạo bảng `refresh_tokens`

```sql
-- Migration: 003_create-refresh-tokens-table.sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  replaced_by UUID REFERENCES refresh_tokens(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

**Giải thích thiết kế:**
- `token_hash`: lưu hash của refresh token (KHÔNG lưu plaintext)
- `is_revoked`: đánh dấu token đã bị thu hồi
- `replaced_by`: trỏ đến token mới thay thế (phục vụ rotation + reuse detection)
- `user_agent` + `ip_address`: audit logging

---

## 6. REST API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Auth Endpoints

| Method | Path | Auth | Mô tả | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Đăng ký user mới | `{ email, password, fullName, role? }` | `{ success, data: { user, accessToken } }` + set refresh cookie |
| POST | `/api/v1/auth/login` | ❌ | Đăng nhập | `{ email, password }` | `{ success, data: { user, accessToken } }` + set refresh cookie |
| POST | `/api/v1/auth/refresh` | ❌ (cookie) | Refresh access token | Không body (đọc cookie) | `{ success, data: { accessToken } }` + set refresh cookie mới |
| POST | `/api/v1/auth/logout` | ✅ | Đăng xuất | Không body | `{ success, message }` + clear cookie |

### 6.2 Profile Endpoints

| Method | Path | Auth | Mô tả | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/api/v1/users/me` | ✅ | Lấy profile bản thân | — | `{ success, data: { user } }` |
| PATCH | `/api/v1/users/me` | ✅ | Cập nhật profile | `{ fullName?, phoneNumber?, avatarUrl?, bio? }` | `{ success, data: { user } }` |

### 6.3 Response Format chuẩn

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Email không đúng định dạng" }
    ]
  }
}
```

### 6.4 User object trả về (KHÔNG BAO GIỜ trả password_hash)

```typescript
interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: 'worker' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 6.5 Validation Rules

**Register:**
- `email`: required, valid email format, unique
- `password`: required, min 8 chars, phải có chữ hoa + chữ thường + số
- `fullName`: required, min 2 chars, max 100 chars
- `role`: optional, enum ['worker', 'employer'], default 'worker'

**Login:**
- `email`: required, valid email
- `password`: required

**Update Profile:**
- `fullName`: optional, min 2, max 100
- `phoneNumber`: optional, regex pattern cho phone
- `avatarUrl`: optional, valid URL
- `bio`: optional, max 500 chars

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer — Cần bổ sung/cập nhật

**Entities/Value Objects cần có:**

```
domain/
├── entities/
│   └── User.ts                    # Cập nhật: thêm profile fields, thêm methods
├── value-objects/
│   ├── Email.ts                   # MỚI: validate email format
│   ├── Password.ts                # MỚI: validate strength, hash/verify
│   └── UserRole.ts                # MỚI: enum + validation
├── repositories/
│   ├── IUserRepository.ts         # Cập nhật: thêm methods
│   └── IRefreshTokenRepository.ts # MỚI
└── errors/
    ├── DomainError.ts             # Có từ M1
    ├── UserNotFoundError.ts       # Có từ M1
    ├── DuplicateEmailError.ts     # Có từ M1
    └── InvalidCredentialsError.ts # MỚI
```

**User entity phải có:**
- Constructor nhận props
- Factory method `User.create(props)` cho đăng ký mới
- Method `updateProfile(props)` cho cập nhật profile
- KHÔNG chứa logic hash password (đó là infrastructure concern)
- Getters cho tất cả fields
- `toResponse()` method trả UserResponse (loại bỏ password_hash)

**IUserRepository interface:**
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
}
```

**IRefreshTokenRepository interface:**
```typescript
interface IRefreshTokenRepository {
  create(data: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ipAddress?: string }): Promise<RefreshTokenRecord>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeById(id: string, replacedById?: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>; // cleanup
}
```

### 7.2 Application Layer — Use Cases

```
application/
├── use-cases/
│   └── auth/
│       ├── RegisterUseCase.ts      # Implement logic thật
│       ├── LoginUseCase.ts         # Implement logic thật
│       ├── RefreshTokenUseCase.ts  # Implement logic thật
│       ├── LogoutUseCase.ts        # MỚI
│       ├── GetProfileUseCase.ts    # MỚI
│       └── UpdateProfileUseCase.ts # MỚI
├── dtos/
│   ├── RegisterDTO.ts             # Cập nhật
│   ├── LoginDTO.ts                # Cập nhật
│   ├── AuthResponseDTO.ts         # Cập nhật
│   ├── UpdateProfileDTO.ts        # MỚI
│   └── UserResponseDTO.ts         # MỚI
└── interfaces/
    ├── IAuthService.ts            # Cập nhật
    ├── IPasswordService.ts        # MỚI: hash, verify
    └── ITokenService.ts           # MỚI: generateAccessToken, generateRefreshToken, verifyAccessToken
```

**Luồng RegisterUseCase:**
1. Validate input (Zod schema ở interface layer)
2. Check email chưa tồn tại → nếu tồn tại throw DuplicateEmailError
3. Hash password (qua IPasswordService)
4. Tạo User entity
5. Lưu vào DB (qua IUserRepository)
6. Tạo access token + refresh token (qua ITokenService)
7. Lưu refresh token hash vào DB (qua IRefreshTokenRepository)
8. Trả user + accessToken + refreshToken

**Luồng LoginUseCase:**
1. Tìm user theo email → nếu không tìm thấy throw InvalidCredentialsError
2. Kiểm tra status === 'active' → nếu không throw AppError
3. So sánh password hash → nếu sai throw InvalidCredentialsError (dùng CÙNG error message với bước 1)
4. Tạo access token + refresh token
5. Lưu refresh token vào DB
6. Trả user + accessToken + refreshToken

**Luồng RefreshTokenUseCase:**
1. Nhận refresh token từ cookie
2. Hash token, tìm trong DB
3. Kiểm tra: chưa revoked + chưa expired
4. Nếu token đã bị revoked → **Token Reuse Detection**: revoke TẤT CẢ tokens của user → throw error
5. Revoke token cũ
6. Tạo refresh token mới, lưu DB (set replaced_by trên token cũ)
7. Tạo access token mới
8. Trả accessToken + refreshToken mới

**Luồng LogoutUseCase:**
1. Nhận refresh token từ cookie
2. Tìm và revoke token trong DB
3. Trả success (luôn trả success kể cả token không tìm thấy — tránh info leak)

**Luồng GetProfileUseCase:**
1. Nhận userId từ auth middleware (đã decode từ access token)
2. Tìm user theo id
3. Trả user data (không có password_hash)

**Luồng UpdateProfileUseCase:**
1. Nhận userId + update data
2. Tìm user hiện tại
3. Validate fields được phép sửa (fullName, phoneNumber, avatarUrl, bio)
4. **KHÔNG cho phép sửa**: email, password, role, status (những cái này cần flow riêng)
5. Cập nhật user, set updatedAt = now
6. Trả user mới

### 7.3 Infrastructure Layer — Services & Repositories

```
infrastructure/
├── repositories/
│   ├── PostgresUserRepository.ts        # Implement IUserRepository
│   └── PostgresRefreshTokenRepository.ts # Implement IRefreshTokenRepository
├── services/
│   ├── BcryptPasswordService.ts         # MỚI: implement IPasswordService
│   └── JwtTokenService.ts              # MỚI: implement ITokenService
└── database/
    └── migrations/
        ├── 001_create-users-table.sql   # Có từ M1
        ├── 002_add-user-profile-fields.sql  # MỚI
        └── 003_create-refresh-tokens-table.sql # MỚI
```

**JwtTokenService phải:**
- `generateAccessToken(payload: { userId, email, role })`: sign JWT, exp 15m
- `generateRefreshToken()`: crypto.randomBytes(40).toString('hex')
- `verifyAccessToken(token)`: verify + decode, throw nếu invalid/expired
- `hashRefreshToken(token)`: SHA-256 hash (để lưu DB)

**BcryptPasswordService phải:**
- `hash(password)`: bcrypt.hash(password, 12)
- `verify(password, hash)`: bcrypt.compare(password, hash)

### 7.4 Interface Layer — Routes, Controllers, Middlewares

```
interface/http/
├── routes/
│   ├── auth.routes.ts     # Cập nhật: implement thật
│   └── user.routes.ts     # MỚI
├── controllers/
│   ├── AuthController.ts  # Cập nhật: implement thật
│   └── UserController.ts  # MỚI
├── middlewares/
│   ├── auth.middleware.ts  # Cập nhật: implement JWT verify thật
│   ├── rateLimiter.ts     # MỚI
│   └── ...existing...
└── validators/
    ├── auth.validators.ts  # Cập nhật: Zod schemas thật
    └── user.validators.ts  # MỚI
```

**Auth middleware hoạt động thật:**
1. Đọc `Authorization: Bearer <token>` header
2. Verify JWT bằng ITokenService
3. Decode payload → gắn `req.user = { userId, email, role }` vào request
4. Nếu invalid/expired → throw UnauthorizedError
5. `authorize(...roles)` middleware factory kiểm tra role

**Rate limiter:**
- Sử dụng express-rate-limit (hoặc tương đương)
- Login: 5 requests/phút/IP
- Register: 3 requests/phút/IP
- Chung: 100 requests/phút/IP

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages/Routes cần có

| Route | Page | Auth Required | Mô tả |
|---|---|---|---|
| `/` | Landing page | ❌ | Trang chủ public |
| `/login` | Login page | ❌ (redirect nếu đã login) | Form đăng nhập |
| `/register` | Register page | ❌ (redirect nếu đã login) | Form đăng ký |
| `/dashboard` | Dashboard | ✅ | Trang chính sau login |
| `/profile` | Profile page | ✅ | Xem và sửa profile |

### 8.2 Components cần tạo

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── FormField.tsx       # Input + label + error message
│   ├── Alert.tsx           # Success/error/warning messages
│   ├── LoadingSpinner.tsx
│   └── Avatar.tsx
├── layout/
│   ├── Navbar.tsx          # Navigation bar, hiển thị khác nhau khi login/logout
│   └── AuthLayout.tsx      # Layout cho login/register pages
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── RouteGuard.tsx      # HOC/wrapper bảo vệ protected routes
└── profile/
    ├── ProfileView.tsx
    └── ProfileEditForm.tsx
```

### 8.3 Auth Context & State Management

```
lib/
├── auth/
│   ├── AuthContext.tsx      # React Context + Provider
│   ├── AuthProvider.tsx     # Provider component
│   ├── useAuth.ts          # Custom hook
│   └── types.ts            # Auth state types
└── api/
    ├── client.ts           # Cập nhật: thêm interceptor refresh
    └── auth.api.ts         # MỚI: auth API functions
```

**AuthContext phải quản lý:**
```typescript
interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true khi đang check auth lúc load page
}

interface AuthActions {
  login(email: string, password: string): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  refreshAuth(): Promise<void>;      // gọi /auth/refresh
  updateProfile(data: UpdateProfileData): Promise<void>;
}
```

**Flow khởi tạo app:**
1. App load → AuthProvider mount
2. AuthProvider gọi `/auth/refresh` (cookie tự gửi)
3. Nếu thành công → set user + accessToken → isAuthenticated = true
4. Nếu thất bại → isAuthenticated = false
5. isLoading = false

**HTTP client interceptor:**
1. Mỗi request: gắn `Authorization: Bearer <accessToken>` từ context
2. Nếu response 401:
   a. Gọi `/auth/refresh`
   b. Nếu refresh thành công → retry request gốc với token mới
   c. Nếu refresh thất bại → logout user → redirect /login
3. Đảm bảo chỉ 1 refresh request chạy tại 1 thời điểm (queue mechanism)

### 8.4 Route Guard

**RouteGuard component:**
```
- Wrap layout của (main) route group
- Kiểm tra isAuthenticated từ AuthContext
- Nếu isLoading → hiển thị loading spinner
- Nếu chưa authenticated → redirect sang /login (lưu intended URL)
- Nếu đã authenticated → render children
- Sau login thành công → redirect về intended URL
```

**Guest Guard (cho login/register pages):**
```
- Nếu đã authenticated → redirect sang /dashboard
- Nếu chưa → render page bình thường
```

### 8.5 Form Requirements

**Login Form:**
- Fields: email, password
- Client-side validation bằng Zod (giống BE validation)
- Show/hide password toggle
- Loading state khi submit
- Error display (inline per-field + form-level)
- Link sang register
- Submit → gọi AuthContext.login()

**Register Form:**
- Fields: email, password, confirm password, fullName, role (dropdown: worker/employer)
- Client-side validation
- Password strength indicator (optional nhưng tốt)
- Loading + error states
- Link sang login
- Submit → gọi AuthContext.register()

**Profile Edit Form:**
- Fields: fullName, phoneNumber, avatarUrl, bio
- Pre-populated với data hiện tại
- Email hiển thị nhưng DISABLED (không cho sửa)
- Save + Cancel buttons
- Loading + error + success states

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M2)

- ❌ Social login (Google, Facebook) → milestone sau
- ❌ Email verification / confirm email → milestone sau
- ❌ Forgot password / reset password → milestone sau nếu cần
- ❌ Admin user management UI → milestone sau
- ❌ Upload avatar file (chỉ nhận URL) → milestone sau
- ❌ Change password flow → milestone sau
- ❌ Two-factor authentication → milestone sau
- ❌ OAuth2 / OpenID Connect → milestone sau
- ❌ Account deletion → milestone sau
- ❌ Frontend real UI design (chỉ cần functional, clean, dùng Tailwind cơ bản)

---

## 10. EXTENSION POINTS (Chuẩn bị cho M3/M4)

Khi implement, hãy đảm bảo kiến trúc cho phép mở rộng dễ dàng:

1. **Authorization middleware** phải support role-based access → M3 cần employer-only routes
2. **User entity** phải dễ extend thêm fields → M5 cần worker profile chi tiết
3. **AuthContext** phải expose user role → M3 cần hiển thị UI khác nhau theo role
4. **API client interceptor** phải solid → mọi API call từ M3+ đều dùng
5. **Route guard** phải support role-based routing → M3 cần employer-only pages

---

## 11. YÊU CẦU OUTPUT CỦA BẠN

Hãy tạo kế hoạch triển khai chi tiết và code implementation theo format sau:

### Output 1: Kế hoạch triển khai theo phase

Chia thành các phase/step có thứ tự rõ ràng. Mỗi step gồm:
- Mô tả công việc
- Files cần tạo/sửa
- Commands cần chạy
- Dependencies giữa các steps

Thứ tự đề xuất:
1. Database migrations (thêm profile fields + refresh_tokens table)
2. Domain layer (entities, value objects, repository interfaces, errors)
3. Application layer (use cases, DTOs, service interfaces)
4. Infrastructure layer (repositories implementation, password service, token service)
5. Interface layer – Backend (routes, controllers, validators, middlewares)
6. Frontend auth infrastructure (AuthContext, API client update, route guard)
7. Frontend pages (login, register, profile, dashboard)
8. Testing
9. Documentation update

### Output 2: Cấu trúc thư mục cập nhật

Tree view cho cả backend và frontend, highlight files MỚI và files CẬP NHẬT.

### Output 3: Database migrations

SQL files cụ thể, chạy được.

### Output 4: Code implementation

Code THỰC cho mỗi file. Yêu cầu:
- Code phải compile được, chạy được
- Có TypeScript types đầy đủ
- Có comment giải thích logic quan trọng
- Có error handling
- Tuân thủ Clean Architecture dependency rule
- Có TODO markers cho các extension points

### Output 5: API documentation

Cho mỗi endpoint:
- Method + path
- Request body schema (Zod)
- Response body example
- Error cases
- curl command example để test

### Output 6: Test cases

**Backend tests (Jest + Supertest):**
- Unit tests cho use cases (mock repositories)
- Integration tests cho auth endpoints
- Test validation (email format, password strength)
- Test refresh token rotation
- Test token reuse detection
- Test auth middleware

**Frontend tests (Jest + RTL):**
- Test LoginForm render + validation
- Test RegisterForm render + validation
- Test RouteGuard redirect behavior
- Test AuthContext login/logout flow

### Output 7: Checklist kiểm tra M2 Done

```
- [ ] POST /api/v1/auth/register với data hợp lệ → 201 + user + accessToken + cookie
- [ ] POST /api/v1/auth/register với email trùng → 409
- [ ] POST /api/v1/auth/register với password yếu → 400 + chi tiết lỗi
- [ ] POST /api/v1/auth/login với credentials đúng → 200 + user + accessToken + cookie
- [ ] POST /api/v1/auth/login với credentials sai → 401 + message chung
- [ ] POST /api/v1/auth/refresh với cookie hợp lệ → 200 + accessToken mới + cookie mới
- [ ] POST /api/v1/auth/refresh với cookie đã dùng (reuse) → 401 + revoke all tokens
- [ ] POST /api/v1/auth/logout → 200 + cookie cleared
- [ ] GET /api/v1/users/me với token hợp lệ → 200 + user data (không có password_hash)
- [ ] GET /api/v1/users/me không có token → 401
- [ ] PATCH /api/v1/users/me cập nhật fullName → 200 + data mới
- [ ] PATCH /api/v1/users/me cố sửa email → bị ignore hoặc 400
- [ ] Frontend: truy cập /dashboard khi chưa login → redirect /login
- [ ] Frontend: login thành công → redirect /dashboard
- [ ] Frontend: refresh page khi đã login → vẫn giữ trạng thái login
- [ ] Frontend: logout → redirect /login + không truy cập được /dashboard
- [ ] Frontend: access token hết hạn → tự refresh + retry request
- [ ] Rate limiter: spam login → nhận 429
- [ ] npm run lint → pass
- [ ] npm run typecheck → pass
- [ ] npm test → pass (all auth tests)
```

---

## 12. LƯU Ý QUAN TRỌNG

1. **Viết code THỰC** — compile được, chạy được, test được. Không pseudo code.
2. **Clean Architecture nghiêm ngặt** — domain KHÔNG import infrastructure. Use case nhận dependencies qua constructor injection.
3. **Security first** — KHÔNG log passwords, KHÔNG trả password_hash, KHÔNG tiết lộ account existence khi login fail.
4. **Token rotation là BẮT BUỘC** — refresh token cũ phải bị invalidate khi tạo token mới.
5. **Token reuse detection là BẮT BUỘC** — nếu token đã revoked bị dùng lại → revoke tất cả token của user đó.
6. **httpOnly cookie cho refresh token** — frontend KHÔNG đọc được refresh token, chỉ access token trong memory.
7. **Graceful degradation** — nếu refresh fail → logout gracefully, không crash.
8. **Error messages an toàn** — không tiết lộ thông tin nhạy cảm.
9. **Interceptor phải robust** — xử lý concurrent requests khi refreshing, queue mechanism.
10. **Kế thừa M1** — tận dụng tối đa những gì M1 đã setup (error handling, logging, validation, config). Không tạo lại.
