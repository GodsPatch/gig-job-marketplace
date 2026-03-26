# Implementation Prompt — Milestone 1: Foundation Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M1 – Foundation Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M1

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 1 (Foundation Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- **M1 – Foundation Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M2 – User System Ready (đăng ký/đăng nhập/refresh/logout, hồ sơ, route guard)
- M3 – Job Core Ready (CRUD job, publish/close)
- M4 – Discovery Ready (search, filter, homepage)
- M5 – Marketplace Ready (worker listing, review)
- M6 – Gamification Ready
- M7 – Production Ready
- M8 – Launch

### Trạng thái hiện tại
**Repo chưa có gì.** Bạn xây dựng mọi thứ từ đầu (greenfield).

---

## 2. TECH STACK BẮT BUỘC

| Hạng mục | Công nghệ |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React, TypeScript strict, Tailwind CSS v3 |
| **Backend** | Node.js 20, Express.js, TypeScript strict |
| **Database** | PostgreSQL 16 |
| **Architecture** | Clean Architecture 4 layers, Domain Driven Design, REST API |
| **Monorepo** | npm workspaces |
| **Migration** | node-pg-migrate |
| **Validation** | Zod |
| **Logging** | Winston |
| **Error Tracking** | Sentry |
| **Testing** | Jest + Supertest (BE), Jest + React Testing Library (FE) |
| **CI/CD** | GitHub Actions |
| **Docker** | Docker Compose cho PostgreSQL |
| **DB access** | pg driver trực tiếp (KHÔNG dùng ORM) |
| **API prefix** | `/api/v1/` |
| **Package manager** | npm v10+ |
| **Linting** | ESLint + Prettier, shared config |

---

## 3. MỤC TIÊU MILESTONE M1

Tạo nền tảng kỹ thuật ổn định để M2→M8 phát triển nhanh và an toàn:

1. **Repo structure** chuẩn monorepo, convention rõ ràng
2. **Frontend** (Next.js) boot thành công với base layout
3. **Backend** (Express) boot thành công với Clean Architecture layers
4. **PostgreSQL** chạy bằng Docker Compose
5. **Migration** database hoạt động với baseline migration
6. **Auth skeleton** — chỉ cần khung domain/use case/route, CHƯA cần logic thật
7. **Structured logging** hoạt động end-to-end
8. **Error tracking** (Sentry) tích hợp cơ bản
9. **CI/CD pipeline** chạy lint/typecheck/test/build
10. **README** đủ để dev mới clone và chạy trong 10 phút

---

## 4. QUYẾT ĐỊNH KỸ THUẬT ĐÃ CHỐT

Các quyết định sau đã chốt bởi Solution Architect. Bạn PHẢI tuân theo:

### 4.1 Monorepo Structure

| Hạng mục | Quyết định |
|---|---|
| **Workspace tool** | npm workspaces (native, không cần Nx/Turborepo/Lerna) |
| **App packages** | `apps/web` (frontend), `apps/api` (backend) |
| **Shared packages** | `packages/shared` (shared types, constants) |
| **Node version** | 20 LTS (có .nvmrc) |
| **Root scripts** | dev, build, lint, format, test, typecheck — chạy cho tất cả workspaces |

### 4.2 Backend Architecture (Clean Architecture 4 Layers)

```
apps/api/src/
├── domain/          # Enterprise Business Rules
│   ├── entities/         # Domain entities (pure classes)
│   ├── value-objects/    # Value objects
│   ├── repositories/     # Repository INTERFACES only
│   └── errors/           # Domain-specific errors
├── application/     # Application Business Rules
│   ├── use-cases/        # Use case classes
│   ├── dtos/             # Data transfer objects
│   └── interfaces/       # Port interfaces (services)
├── infrastructure/  # Frameworks & Drivers
│   ├── database/         # DB connection, migrations, seeds
│   ├── repositories/     # Repository IMPLEMENTATIONS
│   ├── logging/          # Winston logger setup
│   ├── config/           # Config management
│   └── error-tracking/   # Sentry setup
├── interface/       # Interface Adapters
│   └── http/
│       ├── routes/       # Express routers
│       ├── controllers/  # Request/response handling
│       ├── middlewares/  # Auth, error, logging middlewares
│       └── validators/   # Zod validation schemas
├── shared/          # Cross-cutting concerns
│   ├── constants/
│   └── utils/
├── app.ts           # Express app setup (middleware chain)
└── server.ts        # Entry point (start server)
```

**Dependency rule BẮT BUỘC**: Domain ← Application ← Infrastructure/Interface.
- Domain KHÔNG import từ bất kỳ layer nào khác
- Application chỉ import từ Domain
- Infrastructure và Interface import từ Application và Domain
- KHÔNG circular dependencies

### 4.3 Frontend Structure

```
apps/web/src/
├── app/                # Next.js App Router
│   ├── (auth)/              # Auth route group (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/              # Main layout group (protected pages)
│   │   └── dashboard/page.tsx
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   └── loading.tsx          # Loading state
├── components/
│   ├── ui/                  # Reusable UI components
│   └── layout/              # Layout components (Navbar, Footer)
├── lib/
│   ├── api/
│   │   └── client.ts        # HTTP client base
│   ├── config/
│   │   └── env.ts           # Environment config
│   └── utils/
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── styles/
    └── globals.css          # Global styles + Tailwind
```

### 4.4 Config Management

| Hạng mục | Quyết định |
|---|---|
| **Backend** | Đọc từ .env, validate bằng Zod schema, fail-fast nếu thiếu biến bắt buộc |
| **Frontend** | NEXT_PUBLIC_ vars, validate type-safe |
| **.env files** | .env.example (committed), .env (gitignored) |

### 4.5 Error Handling Strategy

| Hạng mục | Quyết định |
|---|---|
| **Custom errors** | AppError (base), NotFoundError, ValidationError, UnauthorizedError, ForbiddenError |
| **Error response format** | `{ success: false, error: { code: string, message: string, details?: any } }` |
| **Production** | KHÔNG leak stack trace |
| **Global handler** | Express error middleware bắt tất cả, trả JSON chuẩn, log error |

### 4.6 Logging Strategy

| Hạng mục | Quyết định |
|---|---|
| **Library** | Winston |
| **Format** | JSON ở production, colorized pretty ở development |
| **Levels** | error, warn, info, debug |
| **Correlation ID** | AsyncLocalStorage, tạo/đọc `X-Correlation-ID` header |
| **Request logging** | method, path, status code, duration, correlationId |
| **Singleton** | `import { logger } from '@/infrastructure/logging'` |

### 4.7 API Design

| Hạng mục | Quyết định |
|---|---|
| **Versioning** | URL prefix `/api/v1/` |
| **Response format** | `{ success: true, data: {...} }` hoặc `{ success: false, error: {...} }` |
| **Validation** | Middleware factory: `validate({ body?, params?, query? })` dùng Zod |
| **404** | Global 404 handler cho unknown routes |
| **Health** | GET `/api/v1/health` trả status, uptime, db connectivity |

### 4.8 Auth Strategy (Skeleton cho M1)

| Hạng mục | Quyết định |
|---|---|
| **Approach** | JWT (access + refresh token) — full implementation ở M2 |
| **M1 scope** | Chỉ tạo skeleton: domain model, use case stubs, route placeholders trả 501 |
| **User roles** | worker (default), employer, admin |
| **Middleware** | auth.middleware.ts skeleton, TODO cho M2 |

### 4.9 Database

| Hạng mục | Quyết định |
|---|---|
| **Docker** | PostgreSQL 16, volume persist, health check |
| **Driver** | `pg` package trực tiếp (KHÔNG ORM) |
| **Pool** | pg Pool, graceful shutdown (SIGTERM, SIGINT) |
| **Migration** | node-pg-migrate, SQL-based, timestamp prefix |
| **Scripts** | `migrate:up`, `migrate:down`, `migrate:create` |

### 4.10 CI/CD

| Hạng mục | Quyết định |
|---|---|
| **Platform** | GitHub Actions |
| **Trigger** | push to main, PR to main |
| **Steps** | checkout → setup Node 20 → npm ci → lint → typecheck → test → build |
| **DB** | PostgreSQL service container cho tests |
| **Cache** | npm dependencies |

---

## 5. DATABASE SCHEMA CẦN TRIỂN KHAI

### 5.1 Baseline Migration — Bảng `users` (skeleton cho M2)

```sql
-- Migration: 001_create-users-table.sql

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

**Giải thích:**
- `id`: UUID, không dùng auto-increment
- `role`: 'worker' | 'employer' | 'admin' — M2 sẽ implement logic
- `status`: 'active' | 'inactive' | 'banned' — dự phòng cho moderation
- Indexes trên email (lookup), role (filtering)

### 5.2 Seed Strategy

- Tạo thư mục `infrastructure/database/seeds/`
- Seed script chạy idempotent (dùng `INSERT ... ON CONFLICT DO NOTHING`)
- npm script: `npm run seed -w apps/api`
- M1 chỉ cần seed structure, chưa cần data thật

---

## 6. API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Health Check (hoạt động thật)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/health` | ❌ | Kiểm tra server + DB connectivity |

**Response khi healthy (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 12345,
    "timestamp": "2026-03-12T14:00:00Z",
    "database": {
      "status": "connected",
      "latency": "5ms"
    }
  }
}
```

**Response khi unhealthy (503):**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database connection failed"
  }
}
```

### 6.2 Auth Skeleton (trả 501 — placeholder cho M2)

| Method | Path | Auth | Response |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | 501 Not Implemented |
| POST | `/api/v1/auth/login` | ❌ | 501 Not Implemented |
| POST | `/api/v1/auth/refresh` | ❌ | 501 Not Implemented |
| POST | `/api/v1/auth/logout` | ❌ | 501 Not Implemented |

**Response format cho 501:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "This endpoint will be implemented in M2"
  }
}
```

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer

**Files cần tạo:**
```
domain/
├── entities/
│   └── User.ts
├── value-objects/
│   └── (trống — chuẩn bị structure cho M2)
├── repositories/
│   └── IUserRepository.ts
└── errors/
    ├── DomainError.ts
    ├── UserNotFoundError.ts
    └── DuplicateEmailError.ts
```

**User entity (skeleton):**
```typescript
// domain/entities/User.ts
// - Pure class, KHÔNG import infrastructure
// - Properties: id, email, passwordHash, fullName, role, status, createdAt, updatedAt
// - Constructor nhận props object
// - Getters cho tất cả fields
// - toResponse() method loại bỏ passwordHash
// - CHỈ là skeleton structure, logic sẽ được implement ở M2
```

**IUserRepository (interface only):**
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
```

**Domain errors:**
- `DomainError` — base class, extends Error
- `UserNotFoundError` — extends DomainError
- `DuplicateEmailError` — extends DomainError

### 7.2 Application Layer

**Files cần tạo:**
```
application/
├── use-cases/
│   └── auth/
│       ├── RegisterUseCase.ts    # Stub: throw NotImplementedError
│       ├── LoginUseCase.ts       # Stub: throw NotImplementedError
│       └── RefreshTokenUseCase.ts # Stub: throw NotImplementedError
├── dtos/
│   ├── RegisterDTO.ts
│   ├── LoginDTO.ts
│   └── AuthResponseDTO.ts
└── interfaces/
    └── IAuthService.ts           # Interface skeleton
```

**Use case stubs:**
- Mỗi use case có class với method `execute()`
- Method throw error với message "Not implemented — will be completed in M2"
- Constructor nhận dependencies qua injection (dù chưa dùng)
- Có TODO comments rõ ràng cho M2

### 7.3 Infrastructure Layer

**Files cần tạo:**
```
infrastructure/
├── database/
│   ├── connection.ts              # pg Pool, graceful shutdown
│   ├── migrations/
│   │   └── 001_create-users-table.sql
│   └── seeds/
│       └── 001_seed-users.ts      # Seed script skeleton
├── repositories/
│   └── (trống — implement ở M2)
├── logging/
│   ├── logger.ts                  # Winston singleton
│   └── correlation.ts            # AsyncLocalStorage + correlation ID
├── config/
│   └── index.ts                   # Zod schema validate .env
└── error-tracking/
    └── sentry.ts                  # Sentry init, graceful skip nếu không DSN
```

**Config phải validate (Zod):**
```typescript
// Các biến bắt buộc:
{
  NODE_ENV: 'development' | 'production' | 'test',
  PORT: number (default 4000),
  DATABASE_URL: string,
  DB_HOST: string,
  DB_PORT: number,
  DB_NAME: string,
  DB_USER: string,
  DB_PASSWORD: string,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string (default '15m'),
  SENTRY_DSN: string (optional),
  CORS_ORIGIN: string (default 'http://localhost:3000'),
  LOG_LEVEL: string (default 'info'),
}
```

**Database connection (connection.ts):**
- Tạo pg Pool từ config
- Test connection khi boot (query `SELECT NOW()`)
- Graceful shutdown: pool.end() on SIGTERM/SIGINT
- Export pool + query helper

**Winston logger (logger.ts):**
- Singleton instance
- JSON transport ở production
- Colorized Console transport ở development
- Timestamp trong mọi log entry
- Log levels: error, warn, info, debug

**Correlation ID (correlation.ts):**
- AsyncLocalStorage để store correlation ID
- Middleware: tạo UUID nếu không có `X-Correlation-ID` header
- Logger integration: tự động gắn correlation ID vào mỗi log entry
- Response header: trả `X-Correlation-ID`

**Sentry (sentry.ts):**
- Init Sentry nếu có SENTRY_DSN
- Graceful skip nếu không có DSN (log warning, không crash)
- captureException wrapper

### 7.4 Interface Layer

**Files cần tạo:**
```
interface/http/
├── routes/
│   ├── index.ts              # Route aggregator
│   ├── health.routes.ts      # GET /health
│   └── auth.routes.ts        # Auth skeleton routes
├── controllers/
│   └── AuthController.ts     # Stub controller
├── middlewares/
│   ├── errorHandler.ts       # Global error middleware
│   ├── validate.ts           # Zod validation middleware factory
│   ├── auth.middleware.ts     # Auth skeleton (placeholder)
│   ├── requestLogger.ts      # Log request/response
│   └── correlationId.ts      # Correlation ID middleware
└── validators/
    └── auth.validators.ts     # Zod schemas (skeleton)
```

**app.ts phải wire các middleware theo thứ tự:**
1. Sentry request handler (nếu có)
2. CORS
3. Body parser (express.json)
4. Correlation ID middleware
5. Request logger middleware
6. Routes
7. 404 handler
8. Sentry error handler (nếu có)
9. Global error handler

**errorHandler middleware:**
1. Nhận error từ next(error)
2. Phân loại: AppError subclass → lấy statusCode + code, Unknown error → 500
3. Log error (dùng logger)
4. Capture lên Sentry (nếu có)
5. Trả JSON response chuẩn
6. Không leak stack trace ở production

### 7.5 App Entry Points

**server.ts:**
- Import config (validate trước tiên)
- Init Sentry
- Init DB pool + test connection
- Import app
- Start server, log port
- Graceful shutdown handler

**app.ts:**
- Tạo Express app
- Wire tất cả middleware (xem thứ tự ở 7.4)
- Export app (để test dùng được)

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages cần có

| Route | Page | Mô tả |
|---|---|---|
| `/` | Landing page | Trang chủ đơn giản, có title + description dự án |
| `/login` | Login placeholder | Trang placeholder "Đăng nhập — Coming in M2" |
| `/register` | Register placeholder | Trang placeholder "Đăng ký — Coming in M2" |
| `/dashboard` | Dashboard placeholder | Trang placeholder "Dashboard — Coming in M2" |

### 8.2 Components cần tạo

```
components/
├── ui/
│   └── (trống — chuẩn bị structure)
└── layout/
    └── Navbar.tsx    # Navigation bar cơ bản
```

### 8.3 HTTP Client Base

**lib/api/client.ts:**
- Base URL đọc từ `NEXT_PUBLIC_API_URL` env var
- Fetch wrapper hoặc Axios instance
- Default headers: Content-Type: application/json
- Auth header placeholder (comment: "TODO M2 — add Bearer token")
- Error response transform thành typed error object
- Request/response logging ở development

### 8.4 Environment Config

**lib/config/env.ts:**
- Validate `NEXT_PUBLIC_API_URL` (default: http://localhost:4000)
- Validate `NEXT_PUBLIC_SENTRY_DSN` (optional)
- Type-safe access

### 8.5 Error Handling

- `error.tsx` — error boundary, hiển thị "Something went wrong" + retry button
- `not-found.tsx` — custom 404 page
- `loading.tsx` — loading spinner/skeleton

### 8.6 Root Layout

- Import Inter font (Google Fonts)
- Tailwind CSS setup
- HTML lang="vi"
- Metadata: title, description

---

## 9. DOCKER SETUP

### 9.1 docker-compose.yml

```yaml
# Cần bao gồm:
# - PostgreSQL 16
#   - Port: 5432
#   - Volume persist data
#   - Health check
#   - Environment: DB_USER, DB_PASSWORD, DB_NAME từ .env
# - Network: gig-marketplace-network
```

### 9.2 .env.example (root)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gig_marketplace
DB_USER=postgres
DB_PASSWORD=postgres

# Backend
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

# Sentry (optional)
SENTRY_DSN=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 10. CI/CD — GitHub Actions

### 10.1 File: `.github/workflows/ci.yml`

**Trigger:**
- push to `main`
- PR to `main`

**Jobs:**

**Job 1: lint-and-typecheck**
- Checkout
- Setup Node 20
- npm ci
- npm run lint
- npm run typecheck

**Job 2: test**
- Checkout
- Setup Node 20
- Start PostgreSQL service container (port 5432)
- npm ci
- Run migrations
- npm test

**Job 3: build**
- Checkout
- Setup Node 20
- npm ci
- npm run build (cả FE và BE)

**Caching:** Cache npm dependencies (~/.npm)

---

## 11. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M1)

- ❌ Auth logic thật (register, login, JWT sign/verify) → M2
- ❌ UI components thật (button, input, form) → M2+
- ❌ Business logic (job, category, review) → M3+
- ❌ ORM / Prisma / TypeORM → KHÔNG BAO GIỜ (quyết định kiến trúc)
- ❌ Deployment infrastructure (Kubernetes, cloud) → M7/M8
- ❌ Production optimization → M7
- ❌ Monitoring/alerting dashboard → M7/M8
- ❌ Frontend styling đẹp → M2+ (M1 chỉ cần functional)

---

## 12. EXTENSION POINTS (Chuẩn bị cho M2+)

Khi implement, đảm bảo kiến trúc dễ mở rộng:

1. **Auth skeleton** cần đủ structure để M2 chỉ fill logic vào, không cần refactor layers
2. **Domain entities** phải là pure classes, dễ thêm fields/methods
3. **Repository interfaces** phải clean, dễ implement cho bất kỳ DB nào
4. **Middleware chain** phải modular, dễ thêm auth middleware thật ở M2
5. **Router** phải modular, dễ thêm routes mới cho user, job, category...
6. **HTTP client** frontend phải dễ thêm interceptor (auth header, refresh token) ở M2
7. **Error classes** phải dễ extend cho domain-specific errors

---

## 13. YÊU CẦU OUTPUT CỦA BẠN

Hãy tạo kế hoạch triển khai chi tiết và code implementation theo format sau:

### Output 1: Kế hoạch triển khai theo phase

Chia thành các phase có thứ tự rõ ràng. Thứ tự đề xuất:

1. **Phase 1: Monorepo & Tooling** — root package.json, workspaces, ESLint, Prettier, tsconfig.base.json, .gitignore, .editorconfig, .nvmrc
2. **Phase 2: Docker & Database** — docker-compose.yml, .env.example, PostgreSQL
3. **Phase 3: Backend Bootstrap** — Express + TS, entry points, config management
4. **Phase 4: Backend Core Infrastructure** — logging (Winston), correlation ID, error handling, Sentry
5. **Phase 5: Backend API Layer** — routes, health check, auth skeleton, validation middleware
6. **Phase 6: Database Migration** — node-pg-migrate setup, baseline migration, seed structure
7. **Phase 7: Backend Domain & Application Skeleton** — entities, repositories, use cases, DTOs
8. **Phase 8: Frontend Bootstrap** — Next.js + TS + Tailwind, layout, error pages
9. **Phase 9: Frontend Infrastructure** — HTTP client, env config, placeholder pages
10. **Phase 10: Shared Package** — packages/shared setup, shared types
11. **Phase 11: Testing** — Jest config, sample tests (BE + FE)
12. **Phase 12: CI/CD** — GitHub Actions workflow
13. **Phase 13: Documentation** — README, .env.example files, getting started guide

Mỗi phase gồm:
- Mô tả công việc
- Files cần tạo
- Commands cần chạy
- Dependencies với phase khác

### Output 2: Cấu trúc thư mục hoàn chỉnh

Full tree view cho toàn bộ monorepo. Ghi chú vai trò mỗi thư mục.

### Output 3: Database schema & migrations

- SQL migration files cụ thể, chạy được
- Migration config (node-pg-migrate)
- npm scripts

### Output 4: Code implementation

Code THỰC cho MỖI file. Yêu cầu:
- Code phải compile được, chạy được
- TypeScript types đầy đủ
- Comment giải thích logic quan trọng
- Error handling
- Tuân thủ Clean Architecture dependency rule
- TODO markers cho M2 extension points

### Output 5: Docker & CI/CD config

- docker-compose.yml hoàn chỉnh
- GitHub Actions workflow YAML
- Dockerfile nếu cần

### Output 6: Test setup & sample tests

- Jest config cho FE và BE
- Ít nhất 1 unit test backend (health check hoặc config)
- Ít nhất 1 test frontend (render test)
- Supertest setup cho integration tests

### Output 7: Checklist kiểm tra M1 Done

```
- [ ] `git clone` + `npm install` thành công
- [ ] `docker compose up -d` → PostgreSQL chạy, kết nối được
- [ ] `npm run migrate:up -w apps/api` → bảng `users` tạo thành công
- [ ] `npm run dev -w apps/api` → server chạy port 4000, log "listening"
- [ ] `npm run dev -w apps/web` → app chạy port 3000, hiển thị landing page
- [ ] `curl http://localhost:4000/api/v1/health` → 200 + db connected
- [ ] `curl -X POST http://localhost:4000/api/v1/auth/register` → 501 Not Implemented
- [ ] `curl -X POST http://localhost:4000/api/v1/auth/login` → 501 Not Implemented
- [ ] `curl -X POST http://localhost:4000/api/v1/auth/refresh` → 501 Not Implemented
- [ ] `curl -X POST http://localhost:4000/api/v1/auth/logout` → 501 Not Implemented
- [ ] `curl http://localhost:4000/api/v1/nonexistent` → 404 JSON response
- [ ] Request logs hiển thị method, path, status, duration, correlationId
- [ ] Response header có `X-Correlation-ID`
- [ ] Error throw → Sentry capture (hoặc log nếu không có DSN)
- [ ] `npm run lint` → pass (zero errors)
- [ ] `npm run typecheck` → pass (zero errors)
- [ ] `npm test` → pass (all tests green)
- [ ] `npm run build` → build thành công cả FE và BE
- [ ] GitHub Actions pipeline → green
- [ ] README có: prerequisites, getting started, scripts, architecture overview
- [ ] .env.example có đầy đủ biến với comments giải thích
```

---

## 14. LƯU Ý QUAN TRỌNG

1. **Viết code THỰC** — compile được, chạy được, test được. Không pseudo code, không placeholder rỗng.
2. **Clean Architecture nghiêm ngặt** — domain KHÔNG import từ layer ngoài. Mọi dependency inject qua constructor/interface.
3. **Config fail-fast** — thiếu biến môi trường bắt buộc → crash ngay khi boot với message rõ ràng.
4. **Auth là SKELETON** — chỉ structure, routes trả 501. Logic thật ở M2. Nhưng structure phải đúng để M2 chỉ fill code vào.
5. **Logging phải structured** — JSON output, có correlation ID, có timestamp.
6. **Error handling production-grade** — không leak stack trace, response format nhất quán.
7. **Sentry graceful** — không crash nếu không có DSN.
8. **Database connection robust** — pool management, graceful shutdown, connection test khi boot.
9. **README phải đủ** — dev mới clone repo và chạy project trong 10 phút, không cần hỏi ai.
10. **Ưu tiên code chạy được** — hơn code đẹp nhưng chưa test. Mọi thứ phải boot and verify được.
