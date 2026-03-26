# Implementation Prompt — Milestone 4: Discovery Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M4 – Discovery Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M4

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 4 (Discovery Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- M1 – Foundation Ready ✅
- M2 – User System Ready ✅
- M3 – Job Core Ready ✅
- **M4 – Discovery Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M5 – Marketplace Ready (worker listing, review)
- M6 – Gamification Ready
- M7 – Production Ready
- M8 – Launch

### Những gì M1 + M2 + M3 đã cung cấp (bạn kế thừa)

**Từ M1 — Foundation:**
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`
- Express + TypeScript, Clean Architecture 4 layers
- Next.js 14+ App Router + TypeScript + Tailwind CSS
- PostgreSQL 16, Docker Compose, node-pg-migrate
- Winston logging + correlation ID, Sentry error tracking
- Global error handling, Zod validation middleware, config management
- GitHub Actions CI, health check `/api/v1/health`

**Từ M2 — User System:**
- Auth hoàn chỉnh: register, login, refresh (rotation), logout
- JWT access token (15m), httpOnly refresh cookie
- Auth middleware: `authenticate`, `authorize(...roles)`, optionalAuth
- AuthContext + useAuth hook, RouteGuard, GuestGuard
- HTTP client với interceptor tự refresh token
- UI components: Button, Input, FormField, Alert, LoadingSpinner, Navbar, Avatar
- User roles: `worker`, `employer`, `admin`

**Từ M3 — Job Core:**
- **Job** entity với lifecycle: `draft → published → closed`
- **Category** reference data (10 categories, seed)
- Job CRUD: create (draft), edit (draft only), publish, close
- Job detail: public nếu published, owner nếu draft/closed (trả 404 cho non-owner)
- Owner job management: GET `/api/v1/jobs/me` (paginated, filtered)
- Slug strategy: kebab-case + 6-char suffix, unique
- Budget: fixed/hourly/negotiable (VND)
- Location: remote/onsite/hybrid
- Frontend: create/edit forms, my-jobs page, job detail, category menu
- Authorization: employer/admin tạo job, owner only edit/publish/close
- Components: JobForm, JobCard, JobStatusBadge, JobActions, CategorySelect, Pagination

**Database hiện tại (sau M3):**

```sql
-- users (M1+M2)
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

-- refresh_tokens (M2)
CREATE TABLE refresh_tokens (...);

-- categories (M3)
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

-- jobs (M3)
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
-- Indexes: slug, status, created_by, category_id, published_at DESC, (status, published_at DESC)
```

**Existing M3 API endpoints (KHÔNG thay đổi):**
- GET `/api/v1/categories`
- POST `/api/v1/jobs`
- GET `/api/v1/jobs/me`
- GET `/api/v1/jobs/:slug`
- PATCH `/api/v1/jobs/:id`
- POST `/api/v1/jobs/:id/publish`
- POST `/api/v1/jobs/:id/close`

---

## 2. TECH STACK BẮT BUỘC

- **Frontend**: Next.js 14+ (App Router), React, TypeScript strict, Tailwind CSS v3
- **Backend**: Node.js 20, Express.js, TypeScript strict
- **Database**: PostgreSQL 16 (pg driver, KHÔNG ORM)
- **Architecture**: Clean Architecture 4 layers, DDD, REST API
- **Search**: PostgreSQL ILIKE + indexes (KHÔNG cần Elasticsearch ở MVP)
- **Mọi thứ khác**: kế thừa từ M1/M2/M3

---

## 3. MỤC TIÊU MILESTONE M4

Xây dựng trải nghiệm khám phá job hoàn chỉnh cho anonymous + signed-in users:

1. **Home page** — trang chủ marketplace với các khối nội dung discovery
2. **Trending jobs** — danh sách jobs nổi bật theo logic đã chốt
3. **Category listing** — xem jobs theo category
4. **Search** — tìm job bằng keyword
5. **Filter** — lọc job theo bộ filter MVP
6. **Pagination + Sort** — phân trang + sắp xếp kết quả
7. **URL query sync** — trạng thái search/filter đồng bộ URL (shareable, refreshable)

---

## 4. QUYẾT ĐỊNH KỸ THUẬT VÀ NGHIỆP VỤ ĐÃ CHỐT

### 4.1 Quy tắc cốt lõi Discovery

| Quy tắc | Chi tiết |
|---|---|
| **Chỉ job published** | Tất cả API và UI discovery CHỈ hiển thị jobs có `status = 'published'`. Draft và closed KHÔNG BAO GIỜ xuất hiện |
| **Anonymous access** | Tất cả discovery endpoints đều public (không cần auth) |
| **Signed-in bonus** | Hiện tại không khác biệt. Extension point cho M5+ (saved jobs, recommended) |

### 4.2 Trending Jobs — Định nghĩa MVP

| Hạng mục | Quyết định |
|---|---|
| **Logic** | **Recency-weighted** — jobs published gần đây nhất + có view_count cao nhất |
| **Công thức** | Sắp xếp theo `trending_score = view_count + recency_bonus` |
| **Recency bonus** | Jobs published trong 7 ngày gần nhất được boost. Công thức đơn giản: `recency_bonus = GREATEST(0, 7 - EXTRACT(DAY FROM NOW() - published_at)) * 10` |
| **Fallback** | Khi ít dữ liệu (< 5 jobs có view), fallback về `ORDER BY published_at DESC` (newest first) |
| **view_count** | Thêm column `view_count INT DEFAULT 0` vào bảng `jobs`. Tăng +1 mỗi khi gọi GET job detail (published) |
| **Limit** | Home page hiển thị top 8 trending. API hỗ trợ limit parameter |
| **Cache** | Chưa cần cache ở M4. Extension point cho M7 |

**Rationale:** Không có behavioral analytics thật, nên dùng heuristic đơn giản: nhiều người xem + mới đăng = trending. Recency bonus đảm bảo jobs cũ bị đẩy xuống tự nhiên.

### 4.3 Search Strategy

| Hạng mục | Quyết định |
|---|---|
| **Mechanism** | PostgreSQL `ILIKE` trên `title` và `description` |
| **Vietnamese** | ILIKE hoạt động tốt cho Vietnamese text ở MVP scale |
| **Keyword matching** | Tách query thành words, match ALL words (AND logic): `title ILIKE '%word1%' AND title ILIKE '%word2%' OR description ILIKE '%word1%' AND description ILIKE '%word2%'` |
| **Min length** | Query phải >= 2 ký tự |
| **Full-text search** | Extension point — có thể thêm `tsvector` index hoặc Elasticsearch sau, nhưng KHÔNG ở M4 |

### 4.4 Filter Scope MVP

| Filter | Type | Values | Mô tả |
|---|---|---|---|
| `keyword` | string | Free text | Tìm trong title + description |
| `categoryId` | UUID | Chọn 1 category | Filter theo category |
| `categorySlug` | string | Slug | Alternative để category filter (dùng cho URL friendly) |
| `locationType` | string | `remote`, `onsite`, `hybrid` | Filter theo hình thức làm việc |
| `budgetType` | string | `fixed`, `hourly`, `negotiable` | Filter theo loại budget |
| `budgetMin` | number | Positive int | Budget tối thiểu |
| `budgetMax` | number | Positive int | Budget tối đa |

**Lưu ý:** Tất cả filters đều optional. Kết hợp filters = AND logic.

### 4.5 Sort Options

| Sort Key | Query Value | SQL |
|---|---|---|
| Mới nhất (default) | `newest` | `published_at DESC` |
| Cũ nhất | `oldest` | `published_at ASC` |
| Budget cao → thấp | `budget_desc` | `budget_max DESC NULLS LAST` |
| Budget thấp → cao | `budget_asc` | `budget_min ASC NULLS LAST` |
| Trending | `trending` | `trending_score DESC` (xem 4.2) |

### 4.6 Pagination

| Hạng mục | Quyết định |
|---|---|
| **Strategy** | Page-based (offset/limit) — đủ cho MVP |
| **Default** | page=1, limit=12 |
| **Max limit** | 50 |
| **Response** | `{ page, limit, total, totalPages }` |
| **Cursor-based** | Extension point cho M7 nếu cần performance |

### 4.7 Home Page Composition

Home page gồm các sections sau (từ trên xuống):

| Section | Nội dung | Data source |
|---|---|---|
| **Hero** | Search bar + tagline marketplace | Static + search component |
| **Trending Jobs** | Top 8 jobs trending | GET `/api/v1/jobs/public?sort=trending&limit=8` |
| **Category Grid** | Grid hiển thị tất cả categories | GET `/api/v1/categories` (đã có từ M3) |
| **Latest Jobs** | 8 jobs mới nhất | GET `/api/v1/jobs/public?sort=newest&limit=8` |
| **CTA** | Kêu gọi employer đăng việc / worker đăng ký | Static |

### 4.8 Category Listing Strategy

| Hạng mục | Quyết định |
|---|---|
| **URL** | `/categories/:slug` — listing jobs theo category |
| **Data** | Gọi public jobs API với filter `categorySlug` |
| **Layout** | Category info header + job listing (paginated, sortable) |
| **SEO** | Dynamic metadata: title = category name, description = category description |
| **Tích hợp** | Category menu từ M3 link tới category listing pages |

### 4.9 Rendering Strategy (Next.js)

| Page | Strategy | Lý do |
|---|---|---|
| Home page | **SSR** hoặc **ISR** | SEO quan trọng, data thay đổi thường xuyên |
| Category listing | **SSR** | SEO + dynamic data |
| Search results | **CSR** | Interactive filters, URL sync nhanh |
| Job detail | Giữ nguyên M3 | — |

**Giả định:** Dùng Next.js Server Components cho data fetching khi có thể. Client Components cho interactive parts (search bar, filter sidebar).

---

## 5. DATABASE CHANGES CẦN TRIỂN KHAI

### 5.1 Migration: Thêm view_count cho jobs

```sql
-- Migration: 006_add-view-count-to-jobs.sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- Index cho trending sort
CREATE INDEX idx_jobs_view_count ON jobs(view_count DESC);

-- Composite index cho discovery queries
CREATE INDEX idx_jobs_published_discovery
  ON jobs(status, published_at DESC, view_count DESC)
  WHERE status = 'published';

-- Index cho keyword search performance (partial index chỉ published)
CREATE INDEX idx_jobs_title_search
  ON jobs USING gin(to_tsvector('simple', title))
  WHERE status = 'published';
```

**Giải thích:**
- `view_count`: hỗ trợ trending logic
- Partial index `WHERE status = 'published'`: tối ưu cho discovery queries vì chỉ query published jobs
- GIN index trên `tsvector`: chuẩn bị cho full-text search nếu cần upgrade từ ILIKE

### 5.2 Seed: Sample published jobs (development)

Tạo seed script thêm 20-30 published jobs với dữ liệu hợp lý để test discovery UI:
- Phân bổ đều trên các categories
- Mix budget types và location types
- Một số jobs có view_count cao (simulate trending)
- Published_at phân bổ trong 30 ngày gần nhất

---

## 6. REST API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Public Jobs Listing (MỚI — endpoint chính của M4)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/jobs/public` | ❌ | Danh sách published jobs với search/filter/sort/pagination |

**Query Parameters:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `keyword` | string | — | Tìm trong title + description (min 2 chars) |
| `categoryId` | UUID | — | Filter theo category ID |
| `categorySlug` | string | — | Filter theo category slug (alternative) |
| `locationType` | string | — | `remote`, `onsite`, `hybrid` |
| `budgetType` | string | — | `fixed`, `hourly`, `negotiable` |
| `budgetMin` | number | — | Budget tối thiểu |
| `budgetMax` | number | — | Budget tối đa |
| `sort` | string | `newest` | `newest`, `oldest`, `budget_desc`, `budget_asc`, `trending` |
| `page` | number | 1 | Trang |
| `limit` | number | 12 | Items/trang (max 50) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Cần lập trình viên React Native",
        "slug": "can-lap-trinh-vien-react-native-a1b2c3",
        "description": "Mô tả chi tiết...",
        "category": { "id": "uuid", "name": "Lập trình & Công nghệ", "slug": "lap-trinh-cong-nghe" },
        "budgetType": "fixed",
        "budgetMin": 5000000,
        "budgetMax": 5000000,
        "locationType": "remote",
        "location": null,
        "status": "published",
        "createdBy": { "id": "uuid", "fullName": "Nguyễn Văn A", "avatarUrl": null },
        "publishedAt": "2026-03-10T10:00:00Z",
        "viewCount": 42,
        "createdAt": "2026-03-10T09:00:00Z",
        "updatedAt": "2026-03-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 156,
      "totalPages": 13
    },
    "filters": {
      "keyword": "react native",
      "categorySlug": null,
      "locationType": null,
      "budgetType": null,
      "sort": "newest"
    }
  }
}
```

### 6.2 Categories with Job Count (CẬP NHẬT categories endpoint)

Bổ sung `jobCount` cho mỗi category — số lượng published jobs:

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/categories` | ❌ | Categories + published job count |

**Response cập nhật:**
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
        "displayOrder": 1,
        "jobCount": 23
      }
    ]
  }
}
```

### 6.3 Cập nhật Job Detail — Increment view_count

Cập nhật GET `/api/v1/jobs/:slug` (đã có từ M3):
- Khi trả job published cho public → tăng `view_count += 1`
- Khi owner xem job của mình → KHÔNG tăng view_count
- Increment bằng SQL: `UPDATE jobs SET view_count = view_count + 1 WHERE id = $1`
- Async (không block response) nếu có thể

### 6.4 Category Detail (MỚI — optional nhưng tốt)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/categories/:slug` | ❌ | Chi tiết 1 category + metadata |

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Lập trình & Công nghệ",
      "slug": "lap-trinh-cong-nghe",
      "description": "Phát triển phần mềm, web, mobile, AI/ML",
      "icon": "code",
      "jobCount": 23
    }
  }
}
```

### 6.5 Validation Rules

**GET /api/v1/jobs/public:**
- `keyword`: optional, min 2 chars, max 200 chars, trim whitespace
- `categoryId`: optional, valid UUID
- `categorySlug`: optional, string
- `locationType`: optional, enum `remote|onsite|hybrid`
- `budgetType`: optional, enum `fixed|hourly|negotiable`
- `budgetMin`: optional, positive integer
- `budgetMax`: optional, positive integer, >= budgetMin nếu cả hai có
- `sort`: optional, enum `newest|oldest|budget_desc|budget_asc|trending`
- `page`: optional, positive integer, default 1
- `limit`: optional, 1-50, default 12

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer — Bổ sung

```
domain/
├── entities/
│   └── Job.ts               # CẬP NHẬT: thêm viewCount property
├── repositories/
│   └── IJobRepository.ts    # CẬP NHẬT: thêm findPublished(), incrementViewCount()
└── ...existing unchanged...
```

**IJobRepository — thêm methods:**
```typescript
interface IJobRepository {
  // ...existing methods từ M3...

  // MỚI cho M4
  findPublished(filters: PublicJobFilters): Promise<PaginatedResult<Job>>;
  incrementViewCount(jobId: string): Promise<void>;
}
```

**PublicJobFilters type:**
```typescript
interface PublicJobFilters {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  locationType?: 'remote' | 'onsite' | 'hybrid';
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  sort: 'newest' | 'oldest' | 'budget_desc' | 'budget_asc' | 'trending';
  page: number;
  limit: number;
}
```

**ICategoryRepository — thêm method:**
```typescript
interface ICategoryRepository {
  // ...existing...
  findAllWithJobCount(): Promise<CategoryWithCount[]>;  // MỚI
}
```

### 7.2 Application Layer — Use Cases mới

```
application/
├── use-cases/
│   ├── job/
│   │   ├── ...existing M3 use cases...
│   │   ├── SearchPublicJobsUseCase.ts    # MỚI
│   │   └── IncrementViewCountUseCase.ts  # MỚI (hoặc tích hợp vào GetJobDetail)
│   └── category/
│       ├── ListCategoriesUseCase.ts      # CẬP NHẬT: thêm jobCount
│       └── GetCategoryDetailUseCase.ts   # MỚI
└── dtos/
    ├── ...existing...
    ├── PublicJobFiltersDTO.ts             # MỚI
    └── CategoryWithCountDTO.ts           # MỚI
```

**Luồng SearchPublicJobsUseCase:**
1. Validate + sanitize filters (từ query params)
2. Nếu có `categorySlug` → resolve sang `categoryId` (qua ICategoryRepository)
3. Build filter object
4. Gọi IJobRepository.findPublished(filters)
   - WHERE status = 'published'
   - AND keyword ILIKE nếu có
   - AND category_id = nếu có
   - AND location_type = nếu có
   - AND budget_type = nếu có
   - AND budget_max >= budgetMin nếu có
   - AND budget_min <= budgetMax nếu có
   - ORDER BY sort option
   - LIMIT/OFFSET
5. Count total cho pagination
6. Trả jobs + pagination + applied filters

**Luồng GetJobDetailUseCase (CẬP NHẬT từ M3):**
- Sau khi trả job published cho public user → gọi incrementViewCount async
- Owner xem job của mình → KHÔNG increment

**Luồng GetCategoryDetailUseCase:**
1. Tìm category theo slug
2. Count published jobs trong category
3. Trả category + jobCount

### 7.3 Infrastructure Layer

```
infrastructure/
├── repositories/
│   ├── PostgresJobRepository.ts      # CẬP NHẬT: thêm findPublished(), incrementViewCount()
│   └── PostgresCategoryRepository.ts # CẬP NHẬT: thêm findAllWithJobCount()
└── database/
    ├── migrations/
    │   └── 006_add-view-count-to-jobs.sql  # MỚI
    └── seeds/
        └── 003_seed-sample-jobs.ts          # MỚI: sample published jobs cho dev
```

**PostgresJobRepository.findPublished() — SQL query builder:**
```sql
SELECT j.*, c.name as category_name, c.slug as category_slug,
       u.full_name as creator_name, u.avatar_url as creator_avatar,
       -- trending score
       (j.view_count + GREATEST(0, 7 - EXTRACT(DAY FROM NOW() - j.published_at)) * 10) as trending_score
FROM jobs j
  JOIN categories c ON j.category_id = c.id
  JOIN users u ON j.created_by = u.id
WHERE j.status = 'published'
  AND ($1::text IS NULL OR (j.title ILIKE '%' || $1 || '%' OR j.description ILIKE '%' || $1 || '%'))
  AND ($2::uuid IS NULL OR j.category_id = $2)
  AND ($3::text IS NULL OR j.location_type = $3)
  AND ($4::text IS NULL OR j.budget_type = $4)
  AND ($5::numeric IS NULL OR j.budget_max >= $5)
  AND ($6::numeric IS NULL OR j.budget_min <= $6)
ORDER BY
  CASE WHEN $7 = 'newest' THEN j.published_at END DESC,
  CASE WHEN $7 = 'oldest' THEN j.published_at END ASC,
  CASE WHEN $7 = 'budget_desc' THEN j.budget_max END DESC NULLS LAST,
  CASE WHEN $7 = 'budget_asc' THEN j.budget_min END ASC NULLS LAST,
  CASE WHEN $7 = 'trending' THEN (j.view_count + GREATEST(0, 7 - EXTRACT(DAY FROM NOW() - j.published_at)) * 10) END DESC
LIMIT $8 OFFSET $9;
```

**Keyword search (ILIKE) splitting:**
- Tách keyword thành words bằng space
- Mỗi word: `(title ILIKE '%word%' OR description ILIKE '%word%')`
- Kết hợp các words bằng AND
- Ví dụ: "react native" → `(title ILIKE '%react%' OR description ILIKE '%react%') AND (title ILIKE '%native%' OR description ILIKE '%native%')`

**PostgresCategoryRepository.findAllWithJobCount():**
```sql
SELECT c.*, COUNT(j.id) FILTER (WHERE j.status = 'published') as job_count
FROM categories c
LEFT JOIN jobs j ON j.category_id = c.id
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.display_order;
```

### 7.4 Interface Layer

```
interface/http/
├── routes/
│   ├── ...existing...
│   └── job.routes.ts           # CẬP NHẬT: thêm public listing route
├── controllers/
│   ├── JobController.ts        # CẬP NHẬT: thêm searchPublic method
│   └── CategoryController.ts   # CẬP NHẬT
└── validators/
    ├── job.validators.ts        # CẬP NHẬT: thêm publicSearchSchema
    └── ...existing...
```

**Route mới:**
```
GET /api/v1/jobs/public → validate(publicSearchSchema, 'query'), JobController.searchPublic
GET /api/v1/categories/:slug → CategoryController.getBySlug
```

**Lưu ý routing order:** `/api/v1/jobs/public` phải đặt TRƯỚC `/api/v1/jobs/:slug` để Express không interpret "public" là slug parameter.

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages/Routes cần có

| Route | Page | Auth | Render | Mô tả |
|---|---|---|---|---|
| `/` | Home Page | ❌ | SSR/ISR | Trang chủ marketplace |
| `/jobs` | Jobs Search/Browse | ❌ | CSR | Tìm kiếm + filter jobs |
| `/categories/:slug` | Category Listing | ❌ | SSR | Jobs theo category |
| `/jobs/:slug` | Job Detail | ❌ | Giữ M3 | Chi tiết job (đã có) |

### 8.2 Components cần tạo/cập nhật

```
components/
├── discovery/
│   ├── HeroSearch.tsx           # MỚI: hero banner + search bar
│   ├── TrendingJobs.tsx         # MỚI: section trending jobs
│   ├── LatestJobs.tsx           # MỚI: section latest jobs
│   ├── CategoryGrid.tsx         # MỚI: grid categories + job count
│   ├── CTASection.tsx           # MỚI: call-to-action section
│   ├── JobListingGrid.tsx       # MỚI: grid kết quả tìm kiếm
│   ├── SearchBar.tsx            # MỚI: search input with suggestions (basic)
│   ├── FilterSidebar.tsx        # MỚI: sidebar bộ filter
│   ├── FilterChips.tsx          # MỚI: hiển thị active filters + clear
│   ├── SortSelect.tsx           # MỚI: dropdown chọn sort
│   └── SearchResultHeader.tsx   # MỚI: "X kết quả cho 'keyword'" + sort
├── job/
│   ├── JobCard.tsx              # CẬP NHẬT: thêm viewCount display
│   └── ...existing...
├── category/
│   ├── CategoryCard.tsx         # MỚI: card category cho grid (name, icon, jobCount)
│   └── ...existing...
└── shared/
    ├── Pagination.tsx           # Có từ M3
    └── EmptyState.tsx           # Có từ M3
```

### 8.3 API Client Functions

```typescript
// lib/api/jobs.api.ts — BỔ SUNG
export const jobsApi = {
  // ...existing methods...

  // MỚI
  searchPublic(params: PublicSearchParams): Promise<PaginatedJobsResponse>;
};

// lib/api/categories.api.ts — BỔ SUNG
export const categoriesApi = {
  // ...existing...
  getBySlug(slug: string): Promise<CategoryDetailResponse>;  // MỚI
};
```

### 8.4 URL Query Sync Hook

**Tạo custom hook `useSearchParams`:**
```typescript
// hooks/useJobSearch.ts — MỚI
// Quản lý bi-directional sync giữa filter state và URL query params
// - Đọc filters từ URL khi mount / URL thay đổi
// - Cập nhật URL khi user thay đổi filter
// - Debounce keyword input (300ms)
// - Reset page về 1 khi filter thay đổi
// - Giữ URL clean: không include param nếu là default value

interface UseJobSearchReturn {
  filters: PublicSearchParams;
  setKeyword(keyword: string): void;
  setCategorySlug(slug: string | null): void;
  setLocationType(type: string | null): void;
  setBudgetType(type: string | null): void;
  setBudgetRange(min: number | null, max: number | null): void;
  setSort(sort: string): void;
  setPage(page: number): void;
  clearAllFilters(): void;
  isFiltered: boolean;  // true nếu có bất kỳ filter nào active
}
```

### 8.5 Home Page Chi Tiết

**Cấu trúc `/` page:**
```
┌─────────────────────────────────────┐
│           HERO SEARCH               │
│  "Tìm việc gig phù hợp với bạn"    │
│  [🔍 Tìm kiếm việc...          ]   │
│  Popular: React, Design, Marketing  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         TRENDING JOBS (8)           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Card │ │Card │ │Card │ │Card │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Card │ │Card │ │Card │ │Card │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│            [Xem tất cả →]          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         CATEGORY GRID               │
│  ┌──────────┐ ┌──────────┐ ┌─────┐ │
│  │💻 Lập    │ │🎨 Thiết  │ │📢   │ │
│  │trình (23)│ │kế (15)   │ │...  │ │
│  └──────────┘ └──────────┘ └─────┘ │
│  ... (responsive grid)              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         LATEST JOBS (8)             │
│  (giống trending layout)            │
│            [Xem tất cả →]          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│              CTA                    │
│  "Bạn là nhà tuyển dụng?"          │
│  [Đăng việc ngay]                   │
│  "Bạn tìm việc?" [Xem việc ngay]  │
└─────────────────────────────────────┘
```

- "Xem tất cả" trending → navigate `/jobs?sort=trending`
- "Xem tất cả" latest → navigate `/jobs?sort=newest`
- Search bar submit → navigate `/jobs?keyword=...`
- Category card click → navigate `/categories/:slug`
- Job card click → navigate `/jobs/:slug`

### 8.6 Jobs Search/Browse Page Chi Tiết (`/jobs`)

```
┌──────────────────────────────────────────────┐
│ 🔍 [Tìm kiếm việc...                    ] 🔍 │
├──────────┬───────────────────────────────────┤
│ FILTERS  │  "156 kết quả" | Sort: [Mới nhất▾]│
│          │                                   │
│ Category │  [active filters: React × Remote ×]│
│ ○ Tất cả │                                   │
│ ○ Lập    │  ┌─────────┐ ┌─────────┐ ┌─────┐ │
│   trình  │  │ JobCard │ │ JobCard │ │ ... │ │
│ ○ Thiết  │  └─────────┘ └─────────┘ └─────┘ │
│   kế     │  ┌─────────┐ ┌─────────┐ ┌─────┐ │
│ ...      │  │ JobCard │ │ JobCard │ │ ... │ │
│          │  └─────────┘ └─────────┘ └─────┘ │
│ Location │  ┌─────────┐ ┌─────────┐ ┌─────┐ │
│ □ Remote │  │ JobCard │ │ JobCard │ │ ... │ │
│ □ Onsite │  └─────────┘ └─────────┘ └─────┘ │
│ □ Hybrid │                                   │
│          │  [◀ 1  2  3 ... 13 ▶]             │
│ Budget   │                                   │
│ □ Fixed  │                                   │
│ □ Hourly │                                   │
│ □ Thỏa   │                                   │
│  thuận   │                                   │
│          │                                   │
│ Budget   │                                   │
│ range    │                                   │
│ [min]-[max]│                                 │
│          │                                   │
│[Xóa bộ lọc]│                                │
└──────────┴───────────────────────────────────┘
```

**UX Requirements:**
- Filter thay đổi → auto fetch (debounce 300ms cho keyword)
- URL cập nhật real-time theo filters (replace, không push)
- Page reset về 1 khi filter thay đổi
- Loading: skeleton cards trong khi fetch
- Empty state: "Không tìm thấy job phù hợp. Thử thay đổi bộ lọc."
- Error state: retry button
- Mobile: filter sidebar collapse thành bottom sheet hoặc modal
- Filter chips hiển thị active filters, click × để remove

### 8.7 Category Listing Page (`/categories/:slug`)

```
┌─────────────────────────────────────┐
│ 💻 Lập trình & Công nghệ            │
│ Phát triển phần mềm, web, mobile... │
│ 23 việc đang tuyển                  │
├─────────────────────────────────────┤
│ Sort: [Mới nhất ▾]                  │
│                                     │
│ (Job listing grid — same as search) │
│                                     │
│ [Pagination]                        │
└─────────────────────────────────────┘
```

- Không cần filter sidebar (đã filter by category rồi)
- Có sort dropdown
- Có pagination
- SEO metadata dynamic: `<title>Việc Lập trình & Công nghệ | Gig Marketplace</title>`

### 8.8 Cập nhật Navbar

- Thêm link "Tìm việc" → `/jobs`
- Giữ category menu dropdown từ M3 → từng item link đến `/categories/:slug`
- Mobile: menu responsive

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M4)

- ❌ Saved/bookmarked jobs → M5+
- ❌ Recommended jobs (personalized) → M5+
- ❌ Advanced full-text search (Elasticsearch) → M7 nếu cần
- ❌ Search autocomplete/suggestions (thật sự) → sau
- ❌ Map view cho onsite jobs → sau
- ❌ Job tags/skills filter → sau
- ❌ Infinite scroll (dùng pagination) → sau
- ❌ Cache layer (Redis) cho discovery queries → M7
- ❌ Analytics dashboard (job views, search trends) → M7
- ❌ Admin category CRUD → sau
- ❌ Worker apply/bid → M5

---

## 10. EXTENSION POINTS (Chuẩn bị cho M5+)

1. **Search upgrade** — findPublished() query builder dễ thêm filters mới (tags, skill, experience level)
2. **Elasticsearch migration** — IJobRepository abstraction cho phép swap implementation
3. **Caching** — Use case layer cho phép wrap cache decorator
4. **Saved jobs** — M5 có thể thêm bảng `saved_jobs` và hiển thị icon saved trên JobCard
5. **Recommendation** — Trending logic có thể upgrade thành ML-based scoring
6. **Job application count** — Có thể thêm `application_count` cho social proof

---

## 11. YÊU CẦU OUTPUT CỦA BẠN

### Output 1: Kế hoạch triển khai theo phase

Thứ tự đề xuất:
1. Database migration (view_count + indexes)
2. Seed sample published jobs (development data)
3. Domain/Application layer updates (new use cases, updated repository interfaces)
4. Infrastructure layer (findPublished query builder, view count increment, category with count)
5. Interface layer — Backend (public listing route, updated category route, validators)
6. Frontend shared components (SearchBar, FilterSidebar, JobListingGrid, CategoryCard, etc.)
7. Home page
8. Jobs search/browse page + URL sync hook
9. Category listing page
10. Update Navbar + linking
11. Testing
12. Documentation

### Output 2: Cấu trúc thư mục cập nhật

Tree view highlight MỚI và CẬP NHẬT.

### Output 3: Database changes

Migration SQL + seed script.

### Output 4: Code implementation

Code THỰC, compile + chạy được. TypeScript đầy đủ. Clean Architecture.

### Output 5: API documentation

Method, path, query params, response, error cases, curl commands.

### Output 6: Test cases

**Backend:**
- Test search với keyword trả đúng kết quả
- Test filter by category
- Test filter by locationType, budgetType
- Test budget range filter
- Test sort options (newest, trending, budget)
- Test pagination (page, limit, total, totalPages)
- Test kết hợp nhiều filters
- Test chỉ published jobs xuất hiện
- Test keyword min length validation
- Test view_count increment
- Test trending score calculation
- Test categories with jobCount

**Frontend:**
- Test Home page render sections
- Test search bar submit → navigate
- Test filter sidebar interactions
- Test URL query sync (filter → URL, URL → filter)
- Test empty state khi không có kết quả
- Test pagination navigation
- Test category listing page

### Output 7: Checklist kiểm tra M4 Done

```
- [ ] GET /api/v1/jobs/public → 200 + published jobs only
- [ ] GET /api/v1/jobs/public?keyword=react → kết quả match "react" trong title/description
- [ ] GET /api/v1/jobs/public?categorySlug=lap-trinh-cong-nghe → filter đúng
- [ ] GET /api/v1/jobs/public?locationType=remote → filter đúng
- [ ] GET /api/v1/jobs/public?budgetType=fixed&budgetMin=1000000 → filter đúng
- [ ] GET /api/v1/jobs/public?sort=trending → sắp xếp theo trending score
- [ ] GET /api/v1/jobs/public?sort=budget_desc → sắp xếp budget cao → thấp
- [ ] GET /api/v1/jobs/public?page=2&limit=5 → pagination đúng
- [ ] GET /api/v1/jobs/public?keyword=x → 400 (min 2 chars)
- [ ] GET /api/v1/jobs/public (không có published jobs) → 200 + jobs=[] + total=0
- [ ] GET /api/v1/categories → categories + jobCount
- [ ] GET /api/v1/categories/lap-trinh-cong-nghe → category detail + jobCount
- [ ] GET /api/v1/jobs/:slug (published, anonymous) → view_count tăng +1
- [ ] GET /api/v1/jobs/:slug (published, owner) → view_count KHÔNG tăng
- [ ] Draft/closed jobs KHÔNG xuất hiện trong /jobs/public
- [ ] Frontend: Home page hiển thị hero + trending + categories + latest + CTA
- [ ] Frontend: Click trending job card → navigate /jobs/:slug
- [ ] Frontend: Click category → navigate /categories/:slug
- [ ] Frontend: Submit search → navigate /jobs?keyword=...
- [ ] Frontend: /jobs page hiển thị filter sidebar + results + pagination
- [ ] Frontend: Thay đổi filter → URL cập nhật + kết quả refresh
- [ ] Frontend: Refresh /jobs?keyword=react&locationType=remote → giữ nguyên filters
- [ ] Frontend: Copy URL share → người khác mở thấy cùng kết quả
- [ ] Frontend: /categories/:slug hiển thị category info + jobs  
- [ ] Frontend: Empty state khi không có kết quả
- [ ] Frontend: Loading skeleton khi đang fetch
- [ ] Frontend: Mobile responsive (filter collapse)
- [ ] npm run lint → pass
- [ ] npm run typecheck → pass
- [ ] npm test → pass
```

---

## 12. LƯU Ý QUAN TRỌNG

1. **Viết code THỰC** — compile được, chạy được, test được.
2. **Chỉ published jobs** — TUYỆT ĐỐI không leak draft/closed jobs trong discovery.
3. **URL sync là BẮT BUỘC** — user copy URL share được, refresh không mất filter state.
4. **Performance** — sử dụng partial index `WHERE status = 'published'` cho discovery queries. EXPLAIN query plan nếu cần.
5. **Trending heuristic** — đơn giản nhưng hoạt động. view_count + recency bonus.
6. **ILIKE cho keyword** — đủ cho MVP. Escape special characters (%, _) trong user input.
7. **Kế thừa M1/M2/M3** — dùng lại components (JobCard, Pagination, EmptyState), API client, auth middleware. KHÔNG tạo lại.
8. **Routing order** — `/api/v1/jobs/public` PHẢI đặt trước `/api/v1/jobs/:slug` trong Express router.
9. **SEO** — Home page và category listing dùng SSR/ISR. Dynamic metadata.
10. **Mobile first** — filter sidebar responsive, collapse trên mobile.
