# Implementation Prompt — Milestone 3: Job Core Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M3 – Job Core Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M3

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 3 (Job Core Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- M1 – Foundation Ready ✅ (ĐÃ XONG)
- M2 – User System Ready ✅ (ĐÃ XONG)
- **M3 – Job Core Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M4 – Discovery Ready (homepage, search, filter, trending)
- M5 – Marketplace Ready (worker listing, review)
- M6 – Gamification Ready
- M7 – Production Ready
- M8 – Launch

### Những gì M1 + M2 đã cung cấp (bạn kế thừa)

**Từ M1 — Foundation:**
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`
- Backend Express + TypeScript, cấu trúc Clean Architecture 4 layers
- Frontend Next.js 14+ App Router + TypeScript + Tailwind CSS
- PostgreSQL 16 chạy Docker Compose
- node-pg-migrate configured
- Winston structured logging + correlation ID
- Sentry error tracking
- Global error handling + custom error classes (AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError)
- Zod validation middleware: `validate({ body?, params?, query? })`
- Config management type-safe
- GitHub Actions CI pipeline
- Health check GET `/api/v1/health`

**Từ M2 — User System:**
- Auth hoàn chỉnh: register, login, refresh token (rotation), logout
- JWT access token (15m, HS256, `Authorization: Bearer <token>`)
- Refresh token (httpOnly cookie, lưu hash DB, rotation + reuse detection)
- User profile: GET + PATCH `/api/v1/users/me`
- Auth middleware hoạt động: `authenticate`, `authorize(...roles)`
- Rate limiting (express-rate-limit)
- Route guard frontend (RouteGuard, GuestGuard)
- AuthContext + useAuth hook (React Context, in-memory access token)
- HTTP client với interceptor tự refresh token
- Frontend pages: login, register, dashboard, profile
- UI components: Button, Input, FormField, Alert, LoadingSpinner, Navbar, Avatar

**User roles đã có:**

| Role | Mô tả |
|---|---|
| `worker` | Người tìm việc (default) |
| `employer` | Người đăng tuyển |
| `admin` | Quản trị viên |

**Database hiện tại:**
```sql
-- Bảng users (M1 + M2)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'worker',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  phone_number VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng refresh_tokens (M2)
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
- **Logging**: Winston (đã có)
- **Error Tracking**: Sentry (đã có)
- **Testing**: Jest + Supertest (BE), Jest + React Testing Library (FE)
- **API prefix**: `/api/v1/`

### Ràng buộc kiến trúc backend
```
apps/api/src/
├── domain/          # Entities, Value Objects, Repository Interfaces, Domain Errors
├── application/     # Use Cases, DTOs, Port Interfaces
├── infrastructure/  # DB, Logging, Config, Repositories Implementation
├── interface/       # HTTP Routes, Controllers, Middlewares, Validators
├── shared/
├── app.ts
└── server.ts
```
**Dependency rule**: Domain ← Application ← Infrastructure/Interface. Domain KHÔNG import layer ngoài.

---

## 3. MỤC TIÊU MILESTONE M3

Xây dựng phần lõi quản lý job — domain model vững chắc để M4 (Discovery) xây dựng tiếp:

1. **Category** — reference data, menu hiển thị, filter-ready cho M4
2. **Tạo job** — employer tạo job ở trạng thái draft
3. **Sửa job** — owner sửa job draft
4. **Publish job** — owner publish job draft hợp lệ → hiển thị public
5. **Close job** — owner đóng job đã publish
6. **Job detail** — public xem job published, owner xem job ở mọi trạng thái
7. **Job management** — owner quản lý danh sách jobs của mình

---

## 4. QUYẾT ĐỊNH KỸ THUẬT VÀ NGHIỆP VỤ ĐÃ CHỐT

### 4.1 Job Domain — Lifecycle & State Transitions

**Trạng thái (Status):**

| Status | Mô tả |
|---|---|
| `draft` | Mới tạo hoặc đang soạn, chưa công khai |
| `published` | Đã công khai, hiển thị cho mọi người |
| `closed` | Đã đóng, không nhận thêm |

**State transitions được phép:**

```
    ┌──────────┐
    │  draft   │──────────► published ──────────► closed
    └──────────┘
         │   ▲
         │   │
         └───┘
       (editing)
```

| Từ → Đến | Điều kiện | Ai được phép |
|---|---|---|
| `draft` → `draft` | Editing (sửa nội dung) | Owner only |
| `draft` → `published` | Job phải hợp lệ (title, description, category bắt buộc) | Owner only |
| `published` → `closed` | Bất cứ lúc nào | Owner only |
| `published` → `draft` | **KHÔNG CHO PHÉP** — không unpublish | — |
| `closed` → `published` | **KHÔNG CHO PHÉP** — không reopen | — |
| `closed` → `draft` | **KHÔNG CHO PHÉP** | — |

**Rationale:** Giữ đơn giản cho MVP. Nếu employer muốn đăng lại → tạo job mới.

### 4.2 Authorization Rules

| Action | Rule |
|---|---|
| Tạo job | Authenticated user với role `employer` hoặc `admin` |
| Sửa job | Owner only + job ở trạng thái `draft` only |
| Publish job | Owner only + job ở trạng thái `draft` + job valid |
| Close job | Owner only + job ở trạng thái `published` |
| Xem job detail (public) | Anyone — chỉ job `published` |
| Xem job detail (owner) | Owner — mọi trạng thái |
| List own jobs | Owner — mọi trạng thái, có filter |
| List categories | Anyone — public |
| Admin: xem/quản lý mọi job | `admin` role — mọi trạng thái (extension point, chưa cần UI ở M3) |

### 4.3 Slug Strategy

| Hạng mục | Quyết định |
|---|---|
| **Format** | Tự động từ title: `to-lower-kebab-case` + append short UUID (6 chars) |
| **Unique** | Database UNIQUE constraint |
| **Khi nào tạo** | Khi tạo job mới. Slug KHÔNG thay đổi khi sửa title |
| **Dùng cho** | URL job detail public: `/jobs/:slug` |
| **Lý do** | SEO friendly, human-readable, unique |

### 4.4 Category Strategy

| Hạng mục | Quyết định |
|---|---|
| **Nature** | Reference data — seed vào DB |
| **Hierarchy** | Phẳng (flat) ở M3, có thể thêm parent_id sau nếu cần |
| **Admin CRUD** | KHÔNG ở M3 — chỉ seed |
| **Display** | Menu/dropdown ở frontend, dùng cho tạo job + filter |
| **Soft delete** | Có `is_active` flag |

### 4.5 Budget Strategy

| Hạng mục | Quyết định |
|---|---|
| **Budget type** | Enum: `fixed`, `hourly`, `negotiable` |
| **Khi `fixed`** | `budget_min` = `budget_max` = giá cố định (VND) |
| **Khi `hourly`** | `budget_min` và `budget_max` thể hiện range/giờ (VND) |
| **Khi `negotiable`** | `budget_min` và `budget_max` nullable |
| **Currency** | VND — hardcode ở M3, extensible sau |

### 4.6 Location Strategy

| Hạng mục | Quyết định |
|---|---|
| **Location type** | Enum: `remote`, `onsite`, `hybrid` |
| **Khi `onsite` hoặc `hybrid`** | Field `location` bắt buộc (text, ví dụ: "Hà Nội", "TP.HCM") |
| **Khi `remote`** | `location` nullable |

### 4.7 Job Expiry (Extension Point)

| Hạng mục | Quyết định |
|---|---|
| **M3** | KHÔNG có auto-expire. Job published hiển thị cho đến khi owner close |
| **Sau này** | Có thể thêm `expires_at` field và cron job — nhưng KHÔNG implement ở M3 |

---

## 5. DATABASE SCHEMA CẦN TRIỂN KHAI

### 5.1 Migration: Tạo bảng `categories`

```sql
-- Migration: 004_create-categories-table.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);
```

### 5.2 Migration: Tạo bảng `jobs`

```sql
-- Migration: 005_create-jobs-table.sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  budget_type VARCHAR(20) NOT NULL DEFAULT 'negotiable',
  budget_min NUMERIC(15, 0),
  budget_max NUMERIC(15, 0),
  location_type VARCHAR(20) NOT NULL DEFAULT 'remote',
  location VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_job_status CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT chk_budget_type CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  CONSTRAINT chk_location_type CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  CONSTRAINT chk_budget_range CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);

CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_published_at ON jobs(published_at DESC);
CREATE INDEX idx_jobs_status_published_at ON jobs(status, published_at DESC);
```

### 5.3 Seed: Categories

```sql
-- Seed: categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Lập trình & Công nghệ', 'lap-trinh-cong-nghe', 'Phát triển phần mềm, web, mobile, AI/ML', 'code', 1),
  ('Thiết kế', 'thiet-ke', 'Thiết kế đồ họa, UI/UX, logo, branding', 'palette', 2),
  ('Marketing', 'marketing', 'Digital marketing, SEO, content, social media', 'megaphone', 3),
  ('Viết nội dung', 'viet-noi-dung', 'Viết bài, copywriting, biên dịch, sáng tạo nội dung', 'pencil', 4),
  ('Dịch thuật', 'dich-thuat', 'Dịch tài liệu, phiên dịch, localization', 'globe', 5),
  ('Video & Animation', 'video-animation', 'Dựng video, motion graphics, animation', 'film', 6),
  ('Nhập liệu & Admin', 'nhap-lieu-admin', 'Nhập liệu, data entry, trợ lý ảo', 'clipboard', 7),
  ('Tư vấn & Đào tạo', 'tu-van-dao-tao', 'Tư vấn chuyên môn, coaching, mentoring', 'users', 8),
  ('Kế toán & Tài chính', 'ke-toan-tai-chinh', 'Kế toán, thuế, tư vấn tài chính', 'calculator', 9),
  ('Khác', 'khac', 'Các công việc không thuộc danh mục trên', 'more-horizontal', 10)
ON CONFLICT (slug) DO NOTHING;
```

---

## 6. REST API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Category Endpoints (Public)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/categories` | ❌ | Danh sách categories active, sắp xếp theo display_order |

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Lập trình & Công nghệ",
        "slug": "lap-trinh-cong-nghe",
        "description": "...",
        "icon": "code",
        "displayOrder": 1
      }
    ]
  }
}
```

### 6.2 Job Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/v1/jobs` | ✅ employer/admin | Tạo job mới (draft) |
| GET | `/api/v1/jobs/me` | ✅ | Danh sách jobs của owner (all statuses, paginatable) |
| GET | `/api/v1/jobs/:slug` | Conditional | Job detail — public nếu published, owner nếu draft/closed |
| PATCH | `/api/v1/jobs/:id` | ✅ owner | Sửa job (draft only) |
| POST | `/api/v1/jobs/:id/publish` | ✅ owner | Publish job (draft → published) |
| POST | `/api/v1/jobs/:id/close` | ✅ owner | Close job (published → closed) |

### 6.3 Request/Response chi tiết

#### POST `/api/v1/jobs` — Tạo job

**Request Body:**
```json
{
  "title": "Cần lập trình viên React Native",
  "description": "Mô tả chi tiết job...",
  "categoryId": "uuid-of-category",
  "budgetType": "fixed",
  "budgetMin": 5000000,
  "budgetMax": 5000000,
  "locationType": "remote",
  "location": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "title": "Cần lập trình viên React Native",
      "slug": "can-lap-trinh-vien-react-native-a1b2c3",
      "description": "...",
      "category": { "id": "uuid", "name": "Lập trình & Công nghệ", "slug": "..." },
      "budgetType": "fixed",
      "budgetMin": 5000000,
      "budgetMax": 5000000,
      "locationType": "remote",
      "location": null,
      "status": "draft",
      "createdBy": { "id": "uuid", "fullName": "...", "avatarUrl": "..." },
      "publishedAt": null,
      "closedAt": null,
      "createdAt": "2026-03-12T10:00:00Z",
      "updatedAt": "2026-03-12T10:00:00Z"
    }
  }
}
```

#### GET `/api/v1/jobs/me` — Danh sách jobs owner

**Query Params:**
- `status` (optional): `draft`, `published`, `closed` — filter theo status
- `page` (optional, default 1): trang
- `limit` (optional, default 10, max 50): số items/trang
- `sort` (optional, default `createdAt:desc`): sắp xếp

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET `/api/v1/jobs/:slug` — Job detail

**Logic:**
- Nếu job `published` → trả cho bất kỳ ai (public)
- Nếu job `draft` hoặc `closed`:
  - Nếu user = owner → trả
  - Nếu user = admin → trả
  - Ngược lại → 404 (KHÔNG trả 403 để tránh leak existence)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "title": "...",
      "slug": "...",
      "description": "...",
      "category": { "id": "uuid", "name": "...", "slug": "..." },
      "budgetType": "fixed",
      "budgetMin": 5000000,
      "budgetMax": 5000000,
      "locationType": "remote",
      "location": null,
      "status": "published",
      "createdBy": { "id": "uuid", "fullName": "...", "avatarUrl": "..." },
      "publishedAt": "2026-03-12T12:00:00Z",
      "closedAt": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

#### PATCH `/api/v1/jobs/:id` — Sửa job

**Preconditions:** Owner only, draft only.

**Request Body (all optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "categoryId": "uuid",
  "budgetType": "hourly",
  "budgetMin": 200000,
  "budgetMax": 500000,
  "locationType": "onsite",
  "location": "TP.HCM"
}
```

**Error cases:**
- 404 nếu job không tồn tại hoặc user không phải owner
- 400 nếu job không ở trạng thái draft (`JOB_NOT_EDITABLE`)
- 400 nếu validation fail

#### POST `/api/v1/jobs/:id/publish` — Publish job

**Preconditions:** Owner only, draft only, job valid.

**Validation trước publish:**
- `title` phải có (min 10 chars)
- `description` phải có (min 30 chars)
- `categoryId` phải tồn tại và active
- `budgetType` phải set
- Nếu `budgetType` = `fixed` hoặc `hourly` → `budgetMin` và `budgetMax` bắt buộc
- Nếu `locationType` = `onsite` hoặc `hybrid` → `location` bắt buộc

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": { ...job_with_status_published, "publishedAt": "..." }
  }
}
```

**Error (400 — JOB_NOT_PUBLISHABLE):**
```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_PUBLISHABLE",
    "message": "Job không thể publish",
    "details": [
      { "field": "description", "message": "Mô tả phải có ít nhất 30 ký tự" }
    ]
  }
}
```

#### POST `/api/v1/jobs/:id/close` — Close job

**Preconditions:** Owner only, published only.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": { ...job_with_status_closed, "closedAt": "..." }
  }
}
```

### 6.4 Validation Rules

**Create/Edit Job:**
- `title`: required (create), optional (edit), min 10, max 200 chars
- `description`: required (create), optional (edit), min 30, max 5000 chars
- `categoryId`: required (create), optional (edit), phải tồn tại + active
- `budgetType`: required (create), optional (edit), enum `fixed|hourly|negotiable`
- `budgetMin`: optional, positive integer
- `budgetMax`: optional, positive integer, >= budgetMin nếu cả hai có giá trị
- `locationType`: required (create), optional (edit), enum `remote|onsite|hybrid`
- `location`: conditional (required nếu onsite/hybrid), max 200 chars

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer — Files mới

```
domain/
├── entities/
│   ├── User.ts              # Có từ M2 — không thay đổi
│   ├── Job.ts               # MỚI
│   └── Category.ts          # MỚI
├── value-objects/
│   ├── JobStatus.ts         # MỚI: enum + transition rules
│   ├── BudgetType.ts        # MỚI: enum
│   ├── LocationType.ts      # MỚI: enum
│   └── Slug.ts              # MỚI: slug generation
├── repositories/
│   ├── IUserRepository.ts   # Có từ M2
│   ├── IJobRepository.ts    # MỚI
│   └── ICategoryRepository.ts # MỚI
└── errors/
    ├── ...existing...
    ├── JobNotFoundError.ts        # MỚI
    ├── JobNotEditableError.ts     # MỚI
    ├── JobNotPublishableError.ts  # MỚI
    ├── JobNotClosableError.ts     # MỚI
    ├── InvalidStateTransitionError.ts # MỚI
    └── CategoryNotFoundError.ts   # MỚI
```

**Job entity phải có:**
```typescript
class Job {
  // Properties
  readonly id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  locationType: LocationType;
  location: string | null;
  status: JobStatus;
  createdBy: string;  // userId
  publishedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Factory method
  static create(props: CreateJobProps): Job;  // Tạo job mới ở draft

  // State transition methods — chứa business rules
  publish(): void;    // draft → published, throw nếu invalid
  close(): void;      // published → closed, throw nếu invalid state

  // Update method
  updateDraft(props: UpdateJobProps): void;  // Throw nếu không phải draft

  // Validation
  isPublishable(): { valid: boolean; errors: string[] };  // Check tất cả required fields

  // Query methods
  isOwner(userId: string): boolean;
  isPublic(): boolean;       // status === 'published'
  isDraft(): boolean;
  isClosed(): boolean;

  // Serialization
  toResponse(): JobResponse;  // Format cho API response
}
```

**JobStatus value object:**
```typescript
enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed'
}

// Static method kiểm tra transition
JobStatus.canTransition(from: JobStatus, to: JobStatus): boolean;
```

**Category entity:**
```typescript
class Category {
  readonly id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;

  static create(props): Category;
  toResponse(): CategoryResponse;
}
```

**IJobRepository interface:**
```typescript
interface IJobRepository {
  create(job: Job): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findBySlug(slug: string): Promise<Job | null>;
  update(job: Job): Promise<Job>;
  findByOwner(userId: string, filters: JobListFilters): Promise<PaginatedResult<Job>>;
  existsBySlug(slug: string): Promise<boolean>;
}
```

**ICategoryRepository interface:**
```typescript
interface ICategoryRepository {
  findAll(activeOnly?: boolean): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
}
```

### 7.2 Application Layer — Use Cases

```
application/
├── use-cases/
│   ├── auth/         # Có từ M2 — không thay đổi
│   ├── job/                         # MỚI
│   │   ├── CreateJobUseCase.ts
│   │   ├── UpdateJobUseCase.ts
│   │   ├── PublishJobUseCase.ts
│   │   ├── CloseJobUseCase.ts
│   │   ├── GetJobDetailUseCase.ts
│   │   └── ListOwnerJobsUseCase.ts
│   └── category/                    # MỚI
│       └── ListCategoriesUseCase.ts
├── dtos/
│   ├── ...existing...
│   ├── CreateJobDTO.ts              # MỚI
│   ├── UpdateJobDTO.ts              # MỚI
│   ├── JobResponseDTO.ts            # MỚI
│   ├── JobListFiltersDTO.ts         # MỚI
│   ├── CategoryResponseDTO.ts       # MỚI
│   └── PaginationDTO.ts            # MỚI (shared)
└── interfaces/
    ├── ...existing...
    └── ISlugService.ts              # MỚI (generate unique slug)
```

**Luồng CreateJobUseCase:**
1. Kiểm tra user có role `employer` hoặc `admin`
2. Validate categoryId tồn tại + active (qua ICategoryRepository)
3. Generate slug từ title (qua ISlugService) — đảm bảo unique
4. Validate budget logic (min <= max nếu có)
5. Validate location (required nếu onsite/hybrid)
6. Tạo Job entity (status = draft)
7. Lưu DB (qua IJobRepository)
8. Log action: `job.created` (structured log)
9. Trả job

**Luồng UpdateJobUseCase:**
1. Tìm job theo id
2. Kiểm tra user là owner
3. Kiểm tra job ở trạng thái draft → nếu không throw JobNotEditableError
4. Validate categoryId nếu thay đổi
5. Validate budget/location logic
6. Gọi job.updateDraft(props)
7. Lưu DB
8. Log action: `job.updated`
9. Trả job

**Luồng PublishJobUseCase:**
1. Tìm job theo id
2. Kiểm tra user là owner
3. Kiểm tra job ở trạng thái draft
4. Validate job publishable (tất cả required fields) → nếu không trả chi tiết lỗi
5. Gọi job.publish() — set status, publishedAt
6. Lưu DB
7. Log action: `job.published`
8. Trả job

**Luồng CloseJobUseCase:**
1. Tìm job theo id
2. Kiểm tra user là owner
3. Kiểm tra job ở trạng thái published
4. Gọi job.close() — set status, closedAt
5. Lưu DB
6. Log action: `job.closed`
7. Trả job

**Luồng GetJobDetailUseCase:**
1. Tìm job theo slug (join category + createdBy user info)
2. Logic visibility:
   - Job published → trả cho bất kỳ ai
   - Job draft/closed + user = owner hoặc admin → trả
   - Ngược lại → throw NotFoundError (KHÔNG 403)
3. Trả job với category info + creator info

**Luồng ListOwnerJobsUseCase:**
1. Nhận userId từ auth
2. Query jobs với filters: status, pagination, sort
3. Trả danh sách + pagination metadata

**Luồng ListCategoriesUseCase:**
1. Query categories active, sort theo displayOrder
2. Trả danh sách

### 7.3 Infrastructure Layer

```
infrastructure/
├── repositories/
│   ├── ...existing...
│   ├── PostgresJobRepository.ts         # MỚI
│   └── PostgresCategoryRepository.ts    # MỚI
├── services/
│   ├── ...existing...
│   └── SlugService.ts                   # MỚI: generate slug + check unique
└── database/
    ├── migrations/
    │   ├── ...existing...
    │   ├── 004_create-categories-table.sql  # MỚI
    │   └── 005_create-jobs-table.sql        # MỚI
    └── seeds/
        ├── ...existing...
        └── 002_seed-categories.ts           # MỚI
```

**SlugService:**
- Input: title string
- Output: slug string (kebab-case + 6-char random suffix)
- Retry nếu slug đã tồn tại (max 3 attempts)
- Ví dụ: "Cần lập trình viên React" → `can-lap-trinh-vien-react-a1b2c3`
- Hỗ trợ Vietnamese diacritics removal

**PostgresJobRepository:**
- `create()`: INSERT + RETURNING
- `findById()`: SELECT + JOIN category + JOIN user (creator info)
- `findBySlug()`: SELECT + JOIN category + JOIN user
- `update()`: UPDATE ... SET ... WHERE id = ... + RETURNING
- `findByOwner()`: SELECT + filters + ORDER BY + LIMIT/OFFSET + COUNT

**PostgresCategoryRepository:**
- `findAll()`: SELECT WHERE is_active ORDER BY display_order
- `findById()`: SELECT WHERE id
- `findBySlug()`: SELECT WHERE slug

### 7.4 Interface Layer

```
interface/http/
├── routes/
│   ├── ...existing...
│   ├── job.routes.ts           # MỚI
│   └── category.routes.ts      # MỚI
├── controllers/
│   ├── ...existing...
│   ├── JobController.ts        # MỚI
│   └── CategoryController.ts   # MỚI
├── middlewares/
│   ├── ...existing (auth, errorHandler, validate, rateLimit, etc.)...
│   └── jobOwnership.ts         # MỚI (optional: middleware check ownership)
└── validators/
    ├── ...existing...
    ├── job.validators.ts        # MỚI: Zod schemas
    └── category.validators.ts   # MỚI
```

**Job routes wiring:**
```
POST   /api/v1/jobs           → authenticate, authorize('employer','admin'), validate(createJobSchema), JobController.create
GET    /api/v1/jobs/me         → authenticate, validate(jobListQuerySchema), JobController.listOwn
GET    /api/v1/jobs/:slug      → optionalAuth, JobController.getBySlug
PATCH  /api/v1/jobs/:id        → authenticate, validate(updateJobSchema), JobController.update
POST   /api/v1/jobs/:id/publish → authenticate, JobController.publish
POST   /api/v1/jobs/:id/close   → authenticate, JobController.close
```

**optionalAuth middleware:**
- Giống auth middleware nhưng KHÔNG throw nếu không có token
- Set `req.user = null` nếu anonymous, set `req.user = decoded` nếu có token hợp lệ
- Dùng cho job detail: anonymous xem published, owner xem mọi trạng thái

**Category routes:**
```
GET    /api/v1/categories      → CategoryController.list
```

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages/Routes cần có

| Route | Page | Auth | Role | Mô tả |
|---|---|---|---|---|
| `/jobs/create` | Create Job | ✅ | employer/admin | Form tạo job mới |
| `/jobs/:slug` | Job Detail | ❌ (public) | — | Trang chi tiết job (public nếu published) |
| `/jobs/:slug/edit` | Edit Job | ✅ | owner | Form sửa job (chỉ draft) |
| `/my-jobs` | My Jobs | ✅ | employer/admin | Danh sách jobs của owner |

### 8.2 Components cần tạo

```
components/
├── job/
│   ├── JobForm.tsx              # Shared form cho create + edit
│   ├── JobCard.tsx              # Card hiển thị job trong listing
│   ├── JobStatusBadge.tsx       # Badge hiển thị status (draft/published/closed)
│   ├── JobDetail.tsx            # Chi tiết job (public view)
│   ├── JobManagementTable.tsx   # Bảng quản lý jobs (owner view)
│   ├── JobActions.tsx           # Nút publish/close/edit (owner view)
│   └── BudgetDisplay.tsx        # Hiển thị budget theo type
├── category/
│   ├── CategoryMenu.tsx         # Menu dropdown/sidebar categories
│   └── CategorySelect.tsx       # Select input cho form tạo job
└── shared/
    ├── Pagination.tsx           # Component pagination
    └── EmptyState.tsx           # Component khi danh sách trống
```

### 8.3 API Client Functions

```typescript
// lib/api/jobs.api.ts — MỚI
export const jobsApi = {
  create(data: CreateJobData): Promise<JobResponse>;
  getBySlug(slug: string): Promise<JobResponse>;
  update(id: string, data: UpdateJobData): Promise<JobResponse>;
  publish(id: string): Promise<JobResponse>;
  close(id: string): Promise<JobResponse>;
  listOwn(params: JobListParams): Promise<PaginatedJobsResponse>;
};

// lib/api/categories.api.ts — MỚI
export const categoriesApi = {
  list(): Promise<CategoriesResponse>;
};
```

### 8.4 Frontend Type Definitions

```typescript
// types/job.ts — MỚI
interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategorySummary;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin: number | null;
  budgetMax: number | null;
  locationType: 'remote' | 'onsite' | 'hybrid';
  location: string | null;
  status: 'draft' | 'published' | 'closed';
  createdBy: UserSummary;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

interface UserSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}
```

### 8.5 Page Details

**Create Job Page (`/jobs/create`):**
- Route guard: employer/admin only
- JobForm component với fields:
  - Title (text input)
  - Description (textarea, có thể dùng rich text editor đơn giản sau)
  - Category (select dropdown, load từ API)
  - Budget type (radio: fixed/hourly/negotiable)
  - Budget min/max (conditional, hiện khi fixed/hourly)
  - Location type (radio: remote/onsite/hybrid)
  - Location (text input, conditional, hiện khi onsite/hybrid)
- Validation client-side bằng Zod (match BE validation)
- States: loading, error (per-field + form), success
- Sau tạo thành công → redirect `/my-jobs` hoặc `/jobs/:slug`

**Edit Job Page (`/jobs/:slug/edit`):**
- Route guard: owner only
- Pre-populate JobForm với data hiện tại
- Chỉ cho phép edit nếu status = draft
- Nếu job không phải draft → hiển thị message + redirect
- States: loading data, submitting, error, success

**Job Detail Page (`/jobs/:slug`):**
- Public page (không cần auth)
- Hiển thị đầy đủ: title, description, category, budget, location, status, creator info, dates
- Nếu user = owner → hiển thị thêm JobActions (edit nếu draft, publish nếu draft, close nếu published)
- Nếu job không tìm thấy → 404 page
- SEO: dynamic metadata (title, description)

**My Jobs Page (`/my-jobs`):**
- Route guard: employer/admin only
- Tab/filter theo status: All | Draft | Published | Closed
- Bảng/danh sách jobs với: title, status badge, category, ngày tạo, actions
- Pagination
- Empty state khi chưa có job
- Link tạo job mới
- Actions mỗi job: View | Edit (draft) | Publish (draft) | Close (published)

**Category Menu (component, tích hợp vào Navbar hoặc sidebar):**
- Fetch categories từ API
- Hiển thị dropdown hoặc list
- Click category → navigate (placeholder cho M4 — `/categories/:slug`)
- Cache data (SWR hoặc React Query hoặc đơn giản là state)

### 8.6 Role-based UI

- Navbar hiển thị "Đăng việc" button nếu user role = employer/admin
- "Quản lý Jobs" link trong Navbar nếu employer/admin
- Worker role KHÔNG thấy các link đăng/quản lý job

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M3)

- ❌ Search/filter jobs (public listing) → M4
- ❌ Homepage trending jobs → M4
- ❌ Category listing page (trang hiện tất cả jobs theo category) → M4
- ❌ Job application/bidding (worker ứng tuyển) → M5+
- ❌ Admin CRUD categories (UI quản lý categories) → sau
- ❌ Rich text editor cho description → sau (dùng textarea ở M3)
- ❌ Image upload cho job → sau
- ❌ Job expiry / auto-close → sau
- ❌ Job tags/skills → M4 hoặc sau
- ❌ Saved/bookmarked jobs → sau
- ❌ Job share/social → sau
- ❌ Job analytics/views count → sau
- ❌ Public jobs listing API (GET /api/v1/jobs) → M4

---

## 10. EXTENSION POINTS (Chuẩn bị cho M4+)

1. **GET /api/v1/jobs (public listing)** — M4 sẽ thêm endpoint này với search/filter/pagination. IJobRepository cần chuẩn bị method `findPublished(filters)` nhưng CHƯA implement route ở M3.
2. **Category hierarchy** — Schema có thể thêm `parent_id` sau mà không cần refactor lớn.
3. **Job tags/skills** — Có thể thêm bảng `job_tags` quan hệ many-to-many sau.
4. **Full-text search** — Index trên `title` + `description` có thể thêm sau (tsvector).
5. **Job application/bid** — Có thể thêm bảng `applications` liên kết với `jobs`.
6. **View count** — Có thể thêm column hoặc bảng analytics.

---

## 11. YÊU CẦU OUTPUT CỦA BẠN

Hãy tạo kế hoạch triển khai chi tiết và code implementation theo format sau:

### Output 1: Kế hoạch triển khai theo phase

Thứ tự đề xuất:
1. Database migrations (categories + jobs tables)
2. Category seed data
3. Domain layer (Job entity, Category entity, value objects, errors, repository interfaces)
4. Application layer (use cases, DTOs, service interfaces)
5. Infrastructure layer (PostgresJobRepository, PostgresCategoryRepository, SlugService)
6. Interface layer — Backend (routes, controllers, validators, optionalAuth middleware)
7. Frontend API client + types
8. Frontend components (JobForm, JobCard, CategoryMenu, v.v.)
9. Frontend pages (create, edit, detail, my-jobs)
10. Testing
11. Documentation update

### Output 2: Cấu trúc thư mục cập nhật

Tree view highlight files MỚI.

### Output 3: Database migrations + seed

SQL files cụ thể, chạy được.

### Output 4: Code implementation

Code THỰC cho mỗi file. Yêu cầu:
- Compile được, chạy được
- TypeScript types đầy đủ
- Clean Architecture dependency rule
- Comment cho business logic quan trọng
- TODO markers cho extension points

### Output 5: API documentation

Cho mỗi endpoint: method, path, request/response, error cases, curl command.

### Output 6: Test cases

**Backend tests:**
- Unit tests cho Job entity (state transitions, validation)
- Unit tests cho use cases (mock repositories)
- Integration tests cho job endpoints
- Test authorization (owner only, role only)
- Test state transition rules (publish draft, can't unpublish, can't reopen)
- Test visibility rules (public chỉ xem published)

**Frontend tests:**
- Test JobForm render + validation
- Test job create flow
- Test role-based UI (employer vs worker)
- Test job status actions

### Output 7: Checklist kiểm tra M3 Done

```
- [ ] GET /api/v1/categories → 200 + danh sách categories
- [ ] POST /api/v1/jobs (employer) → 201 + job draft
- [ ] POST /api/v1/jobs (worker) → 403
- [ ] POST /api/v1/jobs (anonymous) → 401
- [ ] GET /api/v1/jobs/me → 200 + danh sách jobs owner
- [ ] GET /api/v1/jobs/me?status=draft → filter đúng
- [ ] GET /api/v1/jobs/:slug (published) → 200 + job detail (public)
- [ ] GET /api/v1/jobs/:slug (draft, anonymous) → 404
- [ ] GET /api/v1/jobs/:slug (draft, owner) → 200
- [ ] PATCH /api/v1/jobs/:id (owner, draft) → 200 + updated job
- [ ] PATCH /api/v1/jobs/:id (owner, published) → 400 JOB_NOT_EDITABLE
- [ ] PATCH /api/v1/jobs/:id (non-owner) → 404
- [ ] POST /api/v1/jobs/:id/publish (owner, draft, valid) → 200 + status published
- [ ] POST /api/v1/jobs/:id/publish (owner, draft, invalid) → 400 + chi tiết lỗi
- [ ] POST /api/v1/jobs/:id/publish (owner, published) → 400 INVALID_TRANSITION
- [ ] POST /api/v1/jobs/:id/close (owner, published) → 200 + status closed
- [ ] POST /api/v1/jobs/:id/close (owner, draft) → 400 INVALID_TRANSITION
- [ ] POST /api/v1/jobs/:id/close (owner, closed) → 400 INVALID_TRANSITION
- [ ] Frontend: /jobs/create hiển thị form (employer only)
- [ ] Frontend: worker truy cập /jobs/create → redirect hoặc denied
- [ ] Frontend: tạo job thành công → redirect my-jobs
- [ ] Frontend: /my-jobs hiển thị danh sách + filter status
- [ ] Frontend: /jobs/:slug hiển thị job detail public
- [ ] Frontend: owner thấy actions (edit/publish/close) trên job detail
- [ ] Frontend: edit job draft → form pre-populated, save thành công
- [ ] Frontend: category menu hiển thị ở frontend
- [ ] Migration chạy thành công (categories + jobs tables)
- [ ] Seed categories chạy thành công
- [ ] npm run lint → pass
- [ ] npm run typecheck → pass
- [ ] npm test → pass
```

---

## 12. LƯU Ý QUAN TRỌNG

1. **Viết code THỰC** — compile được, chạy được, test được.
2. **Clean Architecture nghiêm ngặt** — domain KHÔNG import infrastructure. Job entity chứa business rules (state transitions), use case orchestrate flow.
3. **State transitions trong entity** — Job.publish(), Job.close() phải validate và throw domain error nếu invalid. Đây là core DDD pattern.
4. **Authorization rõ ràng** — owner check ở use case level, role check ở middleware level.
5. **Visibility security** — job draft/closed trả 404 cho non-owner, KHÔNG trả 403 (tránh leak existence).
6. **Slug unique** — retry mechanism khi generate slug, unique constraint ở DB level.
7. **Kế thừa M1/M2** — dùng lại auth middleware, error handling, logging, validation middleware. KHÔNG tạo lại.
8. **optionalAuth middleware** — cần tạo mới cho job detail public access.
9. **Pagination** — implement chuẩn cho /jobs/me, chuẩn bị cho M4 public listing.
10. **Audit logging** — log tất cả state-changing actions (create, update, publish, close) với userId, jobId, action.
