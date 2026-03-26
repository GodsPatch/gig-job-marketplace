# Implementation Prompt — Milestone 5: Marketplace Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M5 – Marketplace Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M5

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 5 (Marketplace Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- M1 – Foundation Ready ✅
- M2 – User System Ready ✅
- M3 – Job Core Ready ✅
- M4 – Discovery Ready ✅
- **M5 – Marketplace Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M6 – Gamification Ready
- M7 – Production Ready
- M8 – Launch

### Những gì M1→M4 đã cung cấp (bạn kế thừa)

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
- Auth middleware: `authenticate`, `authorize(...roles)`, `optionalAuth`
- AuthContext + useAuth hook, RouteGuard, GuestGuard
- HTTP client với interceptor tự refresh token
- User profile: GET/PATCH `/api/v1/users/me`
- UI components: Button, Input, FormField, Alert, LoadingSpinner, Navbar, Avatar
- User roles: `worker`, `employer`, `admin`

**Từ M3 — Job Core:**
- Job entity với lifecycle: `draft → published → closed`
- Category reference data (10 categories, seed)
- Job CRUD: create (draft), edit (draft only), publish, close
- Job detail: public GET `/api/v1/jobs/:slug`
- Owner job management: GET `/api/v1/jobs/me`
- Authorization: employer/admin tạo job, owner only edit/publish/close
- Components: JobForm, JobCard, JobStatusBadge, JobActions, CategorySelect, Pagination

**Từ M4 — Discovery:**
- Public jobs listing: GET `/api/v1/jobs/public` (search/filter/sort/pagination)
- Trending jobs (view_count + recency heuristic)
- Category listing pages: `/categories/:slug`
- Home page: hero search + trending + categories + latest + CTA
- Jobs search/browse page: `/jobs` (filter sidebar, URL sync)
- Categories with job count
- view_count column trên jobs
- Frontend: HeroSearch, FilterSidebar, JobListingGrid, CategoryGrid, SearchBar, SortSelect, Pagination

**Database hiện tại (sau M4):**

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

-- jobs (M3+M4)
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
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_job_status CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT chk_budget_type CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  CONSTRAINT chk_location_type CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  CONSTRAINT chk_budget_range CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);
```

**Existing API endpoints (KHÔNG thay đổi):**
- Auth: POST register/login/refresh/logout
- Users: GET/PATCH `/api/v1/users/me`
- Categories: GET `/api/v1/categories`, GET `/api/v1/categories/:slug`
- Jobs: POST, PATCH, GET (slug, me, public), POST publish/close

---

## 2. TECH STACK BẮT BUỘC

- **Frontend**: Next.js 14+ (App Router), React, TypeScript strict, Tailwind CSS v3
- **Backend**: Node.js 20, Express.js, TypeScript strict
- **Database**: PostgreSQL 16 (pg driver, KHÔNG ORM)
- **Architecture**: Clean Architecture 4 layers, DDD, REST API
- **Mọi thứ khác**: kế thừa từ M1→M4

---

## 3. MỤC TIÊU MILESTONE M5

Biến platform từ "đăng việc một chiều" thành **marketplace hai chiều**:

1. **Worker profile** — hồ sơ chuyên nghiệp: skills, kinh nghiệm, hourly rate, availability
2. **Public profile** — trang profile công khai cho cả worker và employer
3. **Worker listing** — search/filter workers cho employer tìm kiếm
4. **Review system** — employer và worker đánh giá lẫn nhau sau khi hoàn thành job

---

## 4. QUYẾT ĐỊNH KỸ THUẬT VÀ NGHIỆP VỤ ĐÃ CHỐT

### 4.1 Worker Profile — Mở rộng User Profile

| Hạng mục | Quyết định |
|---|---|
| **Kiến trúc** | Tạo bảng `worker_profiles` riêng (1-1 với users WHERE role='worker'), KHÔNG thêm fields vào bảng users |
| **Lý do** | Separation of concerns — user (M2) là auth/identity, worker profile (M5) là marketplace data |
| **Auto-create** | Khi user role=worker register → tự tạo worker_profiles record rỗng |
| **Visibility** | Worker profile public nếu `is_visible = true` AND có đủ thông tin tối thiểu (title + ít nhất 1 skill) |

**Worker profile fields:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `id` | UUID | Auto | PK |
| `user_id` | UUID | FK | 1-1 với users |
| `title` | VARCHAR(150) | Optional | Tiêu đề nghề nghiệp ("Senior React Developer") |
| `hourly_rate` | NUMERIC(10,0) | Optional | Giá/giờ (VND) |
| `experience_years` | INT | Optional | Số năm kinh nghiệm |
| `availability` | VARCHAR(20) | Optional | `available`, `busy`, `unavailable` |
| `portfolio_url` | VARCHAR(500) | Optional | Link portfolio/website |
| `is_visible` | BOOLEAN | Default true | Hiển thị trong worker listing |
| `rating_average` | NUMERIC(3,2) | Default 0 | Rating trung bình (cached, tính từ reviews) |
| `rating_count` | INT | Default 0 | Tổng số reviews nhận được (cached) |
| `jobs_completed` | INT | Default 0 | Số jobs hoàn thành (cached, dùng cho M6+ hoặc manual cập nhật) |

### 4.2 Skills System

| Hạng mục | Quyết định |
|---|---|
| **Kiến trúc** | Bảng `skills` (reference data, seeded) + bảng junction `worker_skills` |
| **Limit** | Mỗi worker tối đa 15 skills |
| **Seed** | 30-40 skills phổ biến, phân theo category |
| **Tìm kiếm** | Employer filter workers theo skills |
| **Quản lý** | Worker tự chọn skills từ danh sách có sẵn (select/tag input) |
| **Custom skills** | KHÔNG ở M5 — chỉ chọn từ danh sách seeded. Extension point cho sau |

### 4.3 Public Profile Strategy

| User Type | Thông tin Public | Thông tin Private |
|---|---|---|
| **Worker** | fullName, avatarUrl, bio, title, skills, hourlyRate, experienceYears, availability, portfolioUrl, ratingAverage, ratingCount, jobsCompleted, reviews nhận được | email, phoneNumber, passwordHash |
| **Employer** | fullName, avatarUrl, bio, tổng số jobs đã đăng, ratingAverage, ratingCount, reviews nhận được | email, phoneNumber, passwordHash |
| **Admin** | KHÔNG có public profile | — |

**URL:** `/users/:id` — public profile page. Hoặc dùng slug nếu muốn friendly hơn → nhưng M5 dùng UUID cho đơn giản. Extension point cho slug sau.

### 4.4 Review/Rating System

| Hạng mục | Quyết định |
|---|---|
| **Ai review ai** | Hai chiều: employer review worker VÀ worker review employer trên cùng 1 job |
| **Khi nào được review** | Chỉ khi job ở trạng thái `closed`. Rationale: close = job hoàn thành |
| **Thang điểm** | 1-5 sao (integer) |
| **Nội dung** | Star rating (bắt buộc) + text comment (optional, max 1000 chars) |
| **Giới hạn** | 1 review per reviewer per job (unique constraint: reviewer_id + job_id) |
| **Edit/Delete** | KHÔNG cho phép edit hoặc delete review ở M5 — immutable |
| **Visibility** | Reviews luôn public, hiển thị trên profile của reviewee |
| **Aggregated rating** | `rating_average` và `rating_count` cached trên worker_profiles (và trên users cho employer). Recalculate khi có review mới |
| **Moderation** | KHÔNG ở M5 — extension point cho admin moderation sau |

**Review workflow:**
```
1. Employer tạo job → publish → worker "hoàn thành" → employer close job
2. Sau khi job closed → cả employer và worker đều CÓ THỂ review lẫn nhau
3. Mỗi bên chỉ review 1 lần cho job đó
4. Review hiển thị trên public profile của người được review
```

**Giả định quan trọng:** Hiện tại chưa có flow "worker apply → employer accept → worker complete" chính thức. Để M5 hoạt động, cần liên kết review với job. Giả định: `created_by` (employer) của job closed CÓ THỂ review bất kỳ worker nào (vì chưa có assignment system). Worker CÓ THỂ review employer (created_by) của job closed bất kỳ.

**Thực tế MVP đơn giản:** Cho phép tạo review trên job closed, chỉ cần:
- Reviewer là authenticated user
- Job ở trạng thái closed
- Reviewer KHÔNG phải là reviewee (không tự review)
- Reviewer chưa review cho job này
- Reviewer phải là employer hoặc worker (liên quan đến job)

### 4.5 Worker Listing/Search

| Hạng mục | Quyết định |
|---|---|
| **Endpoint** | GET `/api/v1/workers` |
| **Visibility** | Chỉ workers với `is_visible = true` + có `title` + có ít nhất 1 skill |
| **Filters** | keyword (title, bio), skills (multi-select), categoryId (skill category), availability, hourlyRate range, rating minimum, experience years minimum |
| **Sort** | rating_desc (default), experience_desc, hourly_rate_asc, hourly_rate_desc, newest |
| **Pagination** | Page-based, default limit=12, max 50 |
| **Search** | ILIKE trên title + bio (giống job search từ M4) |

---

## 5. DATABASE SCHEMA CẦN TRIỂN KHAI

### 5.1 Migration: Bảng `skills`

```sql
-- Migration: 007_create-skills-table.sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_skills_is_active ON skills(is_active);
```

### 5.2 Migration: Bảng `worker_profiles`

```sql
-- Migration: 008_create-worker-profiles-table.sql
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150),
  hourly_rate NUMERIC(10, 0),
  experience_years INT,
  availability VARCHAR(20) DEFAULT 'available',
  portfolio_url VARCHAR(500),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  jobs_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_availability CHECK (availability IN ('available', 'busy', 'unavailable')),
  CONSTRAINT chk_experience_years CHECK (experience_years IS NULL OR experience_years >= 0),
  CONSTRAINT chk_hourly_rate CHECK (hourly_rate IS NULL OR hourly_rate > 0)
);

CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_is_visible ON worker_profiles(is_visible);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(availability);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating_average DESC);
CREATE INDEX idx_worker_profiles_hourly_rate ON worker_profiles(hourly_rate);
```

### 5.3 Migration: Bảng `worker_skills` (junction)

```sql
-- Migration: 009_create-worker-skills-table.sql
CREATE TABLE worker_skills (
  worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (worker_profile_id, skill_id)
);

CREATE INDEX idx_worker_skills_skill_id ON worker_skills(skill_id);
```

### 5.4 Migration: Bảng `reviews`

```sql
-- Migration: 010_create-reviews-table.sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_comment_length CHECK (comment IS NULL OR LENGTH(comment) <= 1000),
  CONSTRAINT chk_not_self_review CHECK (reviewer_id != reviewee_id),
  CONSTRAINT uq_review_per_job UNIQUE (job_id, reviewer_id)
);

CREATE INDEX idx_reviews_job_id ON reviews(job_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewee_created ON reviews(reviewee_id, created_at DESC);
```

### 5.5 Migration: Thêm rating cache cho users (employer rating)

```sql
-- Migration: 011_add-rating-to-users.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;
```

### 5.6 Seed: Skills

```sql
-- Seed: skills (phân theo categories đã có)
-- Lập trình & Công nghệ
INSERT INTO skills (name, slug, category_id) VALUES
  ('JavaScript', 'javascript', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('TypeScript', 'typescript', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('React', 'react', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('Node.js', 'nodejs', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('Python', 'python', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('Java', 'java', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('Flutter', 'flutter', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
  ('PostgreSQL', 'postgresql', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
-- Thiết kế
  ('UI/UX Design', 'ui-ux-design', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
  ('Figma', 'figma', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
  ('Adobe Photoshop', 'adobe-photoshop', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
  ('Logo Design', 'logo-design', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
-- Marketing
  ('SEO', 'seo', (SELECT id FROM categories WHERE slug = 'marketing')),
  ('Google Ads', 'google-ads', (SELECT id FROM categories WHERE slug = 'marketing')),
  ('Facebook Ads', 'facebook-ads', (SELECT id FROM categories WHERE slug = 'marketing')),
  ('Content Marketing', 'content-marketing', (SELECT id FROM categories WHERE slug = 'marketing')),
-- Viết nội dung
  ('Copywriting', 'copywriting', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
  ('Blog Writing', 'blog-writing', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
  ('Technical Writing', 'technical-writing', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
-- Dịch thuật
  ('Anh-Việt', 'anh-viet', (SELECT id FROM categories WHERE slug = 'dich-thuat')),
  ('Nhật-Việt', 'nhat-viet', (SELECT id FROM categories WHERE slug = 'dich-thuat')),
-- Video & Animation
  ('Video Editing', 'video-editing', (SELECT id FROM categories WHERE slug = 'video-animation')),
  ('Motion Graphics', 'motion-graphics', (SELECT id FROM categories WHERE slug = 'video-animation')),
-- Nhập liệu
  ('Data Entry', 'data-entry', (SELECT id FROM categories WHERE slug = 'nhap-lieu-admin')),
  ('Virtual Assistant', 'virtual-assistant', (SELECT id FROM categories WHERE slug = 'nhap-lieu-admin')),
-- Tư vấn
  ('Business Consulting', 'business-consulting', (SELECT id FROM categories WHERE slug = 'tu-van-dao-tao')),
  ('Career Coaching', 'career-coaching', (SELECT id FROM categories WHERE slug = 'tu-van-dao-tao')),
-- Kế toán
  ('Bookkeeping', 'bookkeeping', (SELECT id FROM categories WHERE slug = 'ke-toan-tai-chinh')),
  ('Tax Consulting', 'tax-consulting', (SELECT id FROM categories WHERE slug = 'ke-toan-tai-chinh'))
ON CONFLICT (slug) DO NOTHING;
```

---

## 6. REST API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Worker Profile Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/workers/me/profile` | ✅ worker | Lấy worker profile của mình |
| PATCH | `/api/v1/workers/me/profile` | ✅ worker | Cập nhật worker profile |
| PUT | `/api/v1/workers/me/skills` | ✅ worker | Set danh sách skills (replace toàn bộ) |

**GET `/api/v1/workers/me/profile` Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "title": "Senior React Developer",
      "hourlyRate": 500000,
      "experienceYears": 5,
      "availability": "available",
      "portfolioUrl": "https://portfolio.dev",
      "isVisible": true,
      "ratingAverage": 4.5,
      "ratingCount": 12,
      "jobsCompleted": 8,
      "skills": [
        { "id": "uuid", "name": "React", "slug": "react" },
        { "id": "uuid", "name": "TypeScript", "slug": "typescript" }
      ],
      "user": {
        "id": "uuid",
        "fullName": "Nguyễn Văn A",
        "email": "a@example.com",
        "avatarUrl": null,
        "bio": "...",
        "createdAt": "..."
      }
    }
  }
}
```

**PATCH `/api/v1/workers/me/profile` Request:**
```json
{
  "title": "Senior React Developer",
  "hourlyRate": 500000,
  "experienceYears": 5,
  "availability": "available",
  "portfolioUrl": "https://portfolio.dev",
  "isVisible": true
}
```

**PUT `/api/v1/workers/me/skills` Request:**
```json
{
  "skillIds": ["uuid1", "uuid2", "uuid3"]
}
```
- Max 15 skills
- Tất cả skillIds phải tồn tại + active
- Replace toàn bộ (xóa cũ, chèn mới)

### 6.2 Skills Endpoint (Public)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/skills` | ❌ | Danh sách skills active, grouped by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": [
      { "id": "uuid", "name": "React", "slug": "react", "categoryId": "uuid", "categoryName": "Lập trình & Công nghệ" }
    ]
  }
}
```

### 6.3 Worker Listing (Public)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/workers` | ❌ | Danh sách workers visible, search/filter/sort/pagination |

**Query Parameters:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `keyword` | string | — | Tìm trong title + bio (ILIKE, min 2 chars) |
| `skillIds` | string | — | Comma-separated skill UUIDs (AND logic: worker phải có TẤT CẢ skills) |
| `categoryId` | UUID | — | Workers có skill thuộc category này |
| `availability` | string | — | `available`, `busy`, `unavailable` |
| `hourlyRateMin` | number | — | Rate tối thiểu |
| `hourlyRateMax` | number | — | Rate tối đa |
| `ratingMin` | number | — | Rating tối thiểu (1-5) |
| `experienceMin` | number | — | Kinh nghiệm tối thiểu (năm) |
| `sort` | string | `rating_desc` | `rating_desc`, `experience_desc`, `hourly_rate_asc`, `hourly_rate_desc`, `newest` |
| `page` | number | 1 | Trang |
| `limit` | number | 12 | Items/trang (max 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "workers": [
      {
        "id": "worker_profile_uuid",
        "userId": "uuid",
        "fullName": "Nguyễn Văn A",
        "avatarUrl": null,
        "title": "Senior React Developer",
        "bio": "...",
        "hourlyRate": 500000,
        "experienceYears": 5,
        "availability": "available",
        "ratingAverage": 4.5,
        "ratingCount": 12,
        "jobsCompleted": 8,
        "skills": [
          { "id": "uuid", "name": "React", "slug": "react" }
        ]
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
  }
}
```

### 6.4 Public Profile Endpoint

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/users/:id/profile` | ❌ | Public profile (worker hoặc employer) |

**Response worker:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Nguyễn Văn A",
      "avatarUrl": null,
      "bio": "...",
      "role": "worker",
      "createdAt": "..."
    },
    "workerProfile": {
      "title": "Senior React Developer",
      "hourlyRate": 500000,
      "experienceYears": 5,
      "availability": "available",
      "portfolioUrl": "...",
      "ratingAverage": 4.5,
      "ratingCount": 12,
      "jobsCompleted": 8,
      "skills": [...]
    },
    "recentReviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Làm việc rất tốt...",
        "reviewer": { "id": "uuid", "fullName": "Employer B", "avatarUrl": null },
        "jobTitle": "Cần lập trình viên React",
        "createdAt": "..."
      }
    ]
  }
}
```

**Response employer:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Công ty ABC",
      "avatarUrl": null,
      "bio": "...",
      "role": "employer",
      "createdAt": "..."
    },
    "employerStats": {
      "totalJobsPosted": 15,
      "activeJobs": 3,
      "ratingAverage": 4.2,
      "ratingCount": 8
    },
    "recentReviews": [...]
  }
}
```

### 6.5 Review Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/v1/jobs/:jobId/reviews` | ✅ | Tạo review cho job closed |
| GET | `/api/v1/jobs/:jobId/reviews` | ❌ | Danh sách reviews cho 1 job |
| GET | `/api/v1/users/:userId/reviews` | ❌ | Danh sách reviews nhận được bởi user |

**POST `/api/v1/jobs/:jobId/reviews` Request:**
```json
{
  "revieweeId": "uuid-of-person-being-reviewed",
  "rating": 5,
  "comment": "Làm việc rất chuyên nghiệp và đúng deadline"
}
```

**Validation rules:**
- `revieweeId`: required, UUID, phải tồn tại, KHÔNG phải chính reviewer
- `rating`: required, integer, 1-5
- `comment`: optional, max 1000 chars
- Job phải ở trạng thái `closed`
- Reviewer chưa review cho job này (unique per job per reviewer)
- Reviewer phải liên quan đến job (là created_by/employer HOẶC là worker — xem 4.4)

**GET `/api/v1/users/:userId/reviews` Query:**
- `page`, `limit` (default 10)
- `sort`: `newest` (default), `highest`, `lowest`

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Rất tốt...",
        "reviewer": { "id": "uuid", "fullName": "...", "avatarUrl": null, "role": "employer" },
        "job": { "id": "uuid", "title": "...", "slug": "..." },
        "createdAt": "..."
      }
    ],
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "distribution": { "5": 6, "4": 4, "3": 1, "2": 1, "1": 0 }
    },
    "pagination": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
  }
}
```

### 6.6 Validation Rules tổng hợp

**Worker Profile:**
- `title`: optional, min 5, max 150 chars
- `hourlyRate`: optional, positive integer, max 50,000,000 VND
- `experienceYears`: optional, 0-50
- `availability`: optional, enum `available|busy|unavailable`
- `portfolioUrl`: optional, valid URL
- `isVisible`: optional, boolean

**Skills:**
- `skillIds`: required, array of UUIDs, max 15, tất cả phải tồn tại + active

**Review:**
- `revieweeId`: required, valid UUID, không phải self
- `rating`: required, integer 1-5
- `comment`: optional, max 1000 chars

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer — Files mới

```
domain/
├── entities/
│   ├── ...existing...
│   ├── WorkerProfile.ts       # MỚI
│   ├── Skill.ts               # MỚI
│   └── Review.ts              # MỚI
├── value-objects/
│   ├── ...existing...
│   ├── Availability.ts        # MỚI: enum
│   └── Rating.ts              # MỚI: 1-5 validation
├── repositories/
│   ├── ...existing...
│   ├── IWorkerProfileRepository.ts   # MỚI
│   ├── ISkillRepository.ts           # MỚI
│   └── IReviewRepository.ts          # MỚI
└── errors/
    ├── ...existing...
    ├── WorkerProfileNotFoundError.ts  # MỚI
    ├── ReviewNotAllowedError.ts       # MỚI
    ├── DuplicateReviewError.ts        # MỚI
    ├── JobNotClosedError.ts           # MỚI
    └── SkillLimitExceededError.ts     # MỚI
```

**Review entity:**
```typescript
class Review {
  readonly id: string;
  readonly jobId: string;
  readonly reviewerId: string;
  readonly revieweeId: string;
  readonly rating: number;  // 1-5
  readonly comment: string | null;
  readonly createdAt: Date;

  static create(props: CreateReviewProps): Review;

  // Validation
  static validateCanReview(params: {
    job: Job;
    reviewerId: string;
    revieweeId: string;
    existingReview: Review | null;
  }): { valid: boolean; error?: string };
}
```

**IWorkerProfileRepository:**
```typescript
interface IWorkerProfileRepository {
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  create(profile: WorkerProfile): Promise<WorkerProfile>;
  update(profile: WorkerProfile): Promise<WorkerProfile>;
  findVisible(filters: WorkerListFilters): Promise<PaginatedResult<WorkerProfileWithUser>>;
  updateRating(userId: string, average: number, count: number): Promise<void>;
}
```

**IReviewRepository:**
```typescript
interface IReviewRepository {
  create(review: Review): Promise<Review>;
  findByJobId(jobId: string): Promise<Review[]>;
  findByRevieweeId(userId: string, filters: ReviewListFilters): Promise<PaginatedResult<ReviewWithDetails>>;
  findByReviewerAndJob(reviewerId: string, jobId: string): Promise<Review | null>;
  getAverageRating(revieweeId: string): Promise<{ average: number; count: number }>;
  getRatingDistribution(revieweeId: string): Promise<Record<number, number>>;
}
```

### 7.2 Application Layer — Use Cases

```
application/use-cases/
├── worker-profile/
│   ├── GetMyWorkerProfileUseCase.ts      # MỚI
│   ├── UpdateWorkerProfileUseCase.ts     # MỚI
│   └── UpdateWorkerSkillsUseCase.ts      # MỚI
├── worker-listing/
│   └── SearchWorkersUseCase.ts           # MỚI
├── public-profile/
│   └── GetPublicProfileUseCase.ts         # MỚI
├── review/
│   ├── CreateReviewUseCase.ts             # MỚI
│   ├── ListJobReviewsUseCase.ts           # MỚI
│   └── ListUserReviewsUseCase.ts          # MỚI
├── skill/
│   └── ListSkillsUseCase.ts              # MỚI
└── ...existing...
```

**Luồng CreateReviewUseCase:**
1. Tìm job theo jobId → phải tồn tại
2. Kiểm tra job status = `closed` → nếu không throw JobNotClosedError
3. Kiểm tra revieweeId tồn tại + khác reviewerId → nếu self throw error
4. Kiểm tra reviewer liên quan đến job (là created_by hoặc là worker — MVP: cho phép nếu reviewer hoặc reviewee = created_by)
5. Kiểm tra chưa có review cho job này từ reviewer → nếu có throw DuplicateReviewError
6. Tạo Review entity
7. Lưu DB
8. Recalculate rating cho reviewee: `getAverageRating(revieweeId)` → `updateRating(revieweeId, avg, count)`
9. Nếu reviewee là worker → update worker_profiles.rating_average + rating_count
10. Nếu reviewee là employer → update users.rating_average + rating_count
11. Log: `review.created`
12. Trả review

**Luồng GetPublicProfileUseCase:**
1. Tìm user theo userId
2. Nếu user role = 'worker':
   a. Tìm worker profile + skills
   b. Nếu is_visible = false → trả limited info (chỉ fullName, avatarUrl, role)
   c. Fetch recent reviews (limit 5)
3. Nếu user role = 'employer':
   a. Count total jobs posted + active jobs
   b. Get rating + review data
   c. Fetch recent reviews (limit 5)
4. Trả profile data

**Luồng SearchWorkersUseCase:**
1. Validate + sanitize filters
2. Nếu `categoryId` → resolve skills thuộc category
3. Build filters cho repository
4. Gọi IWorkerProfileRepository.findVisible(filters) — WHERE is_visible + có title + có skills
5. Trả workers + pagination

### 7.3 Infrastructure Layer

```
infrastructure/
├── repositories/
│   ├── ...existing...
│   ├── PostgresWorkerProfileRepository.ts  # MỚI
│   ├── PostgresSkillRepository.ts          # MỚI
│   └── PostgresReviewRepository.ts         # MỚI
└── database/
    ├── migrations/
    │   ├── 007_create-skills-table.sql
    │   ├── 008_create-worker-profiles-table.sql
    │   ├── 009_create-worker-skills-table.sql
    │   ├── 010_create-reviews-table.sql
    │   └── 011_add-rating-to-users.sql
    └── seeds/
        └── 004_seed-skills.ts
```

### 7.4 Interface Layer

```
interface/http/
├── routes/
│   ├── ...existing...
│   ├── worker.routes.ts          # MỚI
│   ├── skill.routes.ts           # MỚI
│   ├── review.routes.ts          # MỚI
│   └── publicProfile.routes.ts   # MỚI
├── controllers/
│   ├── WorkerController.ts       # MỚI
│   ├── SkillController.ts        # MỚI
│   ├── ReviewController.ts       # MỚI
│   └── PublicProfileController.ts # MỚI
└── validators/
    ├── worker.validators.ts       # MỚI
    ├── skill.validators.ts        # MỚI
    └── review.validators.ts       # MỚI
```

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages/Routes cần có

| Route | Page | Auth | Mô tả |
|---|---|---|---|
| `/workers` | Worker Listing | ❌ | Search/filter workers |
| `/users/:id` | Public Profile | ❌ | Profile công khai (worker/employer) |
| `/workers/profile` | Worker Profile Edit | ✅ worker | Sửa worker profile + skills |
| `/jobs/:slug` | Job Detail | Giữ M4 | CẬP NHẬT: thêm section reviews nếu job closed |

### 8.2 Components cần tạo

```
components/
├── worker/
│   ├── WorkerProfileForm.tsx      # MỚI: form edit worker profile
│   ├── SkillsSelector.tsx         # MỚI: multi-select skills (tag input)
│   ├── WorkerCard.tsx             # MỚI: card worker trong listing
│   ├── WorkerFilterSidebar.tsx    # MỚI: filters cho worker listing
│   └── AvailabilityBadge.tsx      # MỚI: badge available/busy/unavailable
├── profile/
│   ├── PublicProfileHeader.tsx    # MỚI: header profile (avatar, name, title, rating)
│   ├── WorkerProfileDetail.tsx    # MỚI: chi tiết worker (skills, hourly, experience)
│   ├── EmployerProfileDetail.tsx  # MỚI: chi tiết employer (jobs posted, rating)
│   └── ProfileCompleteness.tsx    # MỚI: progress bar % hoàn thiện profile
├── review/
│   ├── ReviewForm.tsx             # MỚI: form tạo review (stars + comment)
│   ├── ReviewCard.tsx             # MỚI: hiển thị 1 review
│   ├── ReviewList.tsx             # MỚI: danh sách reviews + pagination
│   ├── StarRating.tsx             # MỚI: hiển thị + interactive stars
│   ├── RatingDisplay.tsx          # MỚI: average rating display (4.5/5 ★★★★☆)
│   └── RatingDistribution.tsx     # MỚI: biểu đồ phân bổ 1-5 sao
└── shared/
    └── ...existing...
```

### 8.3 Worker Listing Page (`/workers`)

Layout tương tự job search page:
- Search bar + filter sidebar + results grid
- URL query sync (reuse useSearchParams pattern từ M4)
- Filters: keyword, skills (multi-select), availability, hourly rate range, experience
- Sort: rating, experience, hourly rate, newest
- Pagination
- Empty/loading/error states

### 8.4 Public Profile Page (`/users/:id`)

```
┌──────────────────────────────────────┐
│  [Avatar]  Nguyễn Văn A             │
│            Senior React Developer    │
│            ★★★★☆ 4.5 (12 reviews)   │
│            💚 Available              │
│  [Portfolio] [Contact]               │
├──────────────────────────────────────┤
│  SKILLS                              │
│  [React] [TypeScript] [Node.js]      │
├──────────────────────────────────────┤
│  THÔNG TIN                           │
│  💰 500,000đ/giờ | 📋 5 năm KN     │
│  ✅ 8 jobs hoàn thành                │
├──────────────────────────────────────┤
│  REVIEWS (12)                        │
│  ┌─ ★★★★★ 5.0 ─────────────────┐   │
│  │ "Làm việc rất tốt..."        │   │
│  │  — Employer B, Job: React app │   │
│  │  2 ngày trước                 │   │
│  └───────────────────────────────┘   │
│  [Xem thêm reviews]                 │
├──────────────────────────────────────┤
│  RATING BREAKDOWN                   │
│  5★ ████████████ 6                  │
│  4★ ████████ 4                      │
│  3★ ██ 1                            │
│  2★ ██ 1                            │
│  1★  0                              │
└──────────────────────────────────────┘
```

### 8.5 Review on Job Detail

Trên job detail page (đã có từ M3), thêm section cuối nếu job `closed`:
- Hiển thị reviews đã có cho job này
- Nếu current user liên quan + chưa review → hiển thị ReviewForm
- Nếu đã review → hiển thị "Bạn đã đánh giá"

### 8.6 Cập nhật Navigation

- Thêm link "Tìm Worker" → `/workers` trong Navbar
- Worker thấy link "Hồ sơ nghề nghiệp" → `/workers/profile`
- Public profile link trên Navbar avatar dropdown

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M5)

- ❌ Job application / bidding system (worker apply cho job) → milestone sau
- ❌ Messaging / chat giữa employer và worker → milestone sau
- ❌ Custom skills (user tự tạo skill) → sau
- ❌ Skill endorsement (người khác endorse skill) → sau
- ❌ Review moderation (admin duyệt/xóa review) → sau
- ❌ Edit/delete review → sau
- ❌ Profile slug (friendly URL) → sau (dùng UUID ở M5)
- ❌ Portfolio upload (chỉ nhận URL) → sau
- ❌ Worker bookmark/favorite → sau
- ❌ Notification khi nhận review → M6+
- ❌ Employer profile edit page riêng (dùng /profile từ M2) → sau

---

## 10. EXTENSION POINTS (Chuẩn bị cho M6+)

1. **Job application** — bảng `applications` link worker ↔ job, formal assignment
2. **Gamification** — M6 sẽ dùng review count, jobs_completed, skill count để tính điểm/achievements
3. **Worker recommendation** — rating + skills + availability data → matching algorithm
4. **Review moderation** — thêm `status` column vào reviews (pending/approved/rejected)
5. **Notification** — review created → notify reviewee
6. **Skill verification** — badge verified skills

---

## 11. YÊU CẦU OUTPUT CỦA BẠN

### Output 1: Kế hoạch triển khai theo phase

Thứ tự đề xuất:
1. Database migrations (skills, worker_profiles, worker_skills, reviews, user rating)
2. Skills seed data
3. Domain layer (entities, value objects, errors, repository interfaces)
4. Application layer (use cases, DTOs)
5. Infrastructure layer (repository implementations)
6. Interface layer — Backend (routes, controllers, validators)
7. Frontend API client + types
8. Frontend components (WorkerCard, ReviewForm, StarRating, etc.)
9. Frontend pages (worker listing, public profile, worker profile edit)
10. Job detail page update (review section)
11. Navigation updates
12. Testing
13. Documentation

### Output 2: Cấu trúc thư mục

Tree view highlight MỚI.

### Output 3: Database migrations + seed

SQL files chạy được.

### Output 4: Code implementation

Code THỰC, TypeScript, Clean Architecture.

### Output 5: API documentation

Endpoints, request/response, curl commands.

### Output 6: Test cases

**Backend:**
- Test create review (valid + invalid cases)
- Test review unique constraint (1 per reviewer per job)
- Test rating calculation (average, count)
- Test job must be closed for review
- Test self-review prevention
- Test worker listing filters (skills, availability, rate range)
- Test worker profile visibility rules
- Test public profile (worker vs employer)
- Test skills limit (max 15)

**Frontend:**
- Test StarRating component (interactive + display)
- Test ReviewForm validation
- Test WorkerCard render
- Test worker listing filter interactions
- Test public profile page (worker vs employer views)

### Output 7: Checklist kiểm tra M5 Done

```
- [ ] GET /api/v1/skills → danh sách skills
- [ ] GET /api/v1/workers/me/profile → worker profile data
- [ ] PATCH /api/v1/workers/me/profile → update thành công
- [ ] PUT /api/v1/workers/me/skills → set skills thành công (max 15)
- [ ] PUT /api/v1/workers/me/skills với >15 skills → 400
- [ ] GET /api/v1/workers → worker listing (chỉ visible workers)
- [ ] GET /api/v1/workers?skillIds=uuid1,uuid2 → filter by skills
- [ ] GET /api/v1/workers?availability=available → filter đúng
- [ ] GET /api/v1/workers?sort=rating_desc → sắp xếp đúng
- [ ] GET /api/v1/users/:id/profile (worker) → public profile + skills + reviews
- [ ] GET /api/v1/users/:id/profile (employer) → public profile + stats + reviews
- [ ] GET /api/v1/users/:id/profile (worker, is_visible=false) → limited info
- [ ] POST /api/v1/jobs/:jobId/reviews (job closed) → 201 + review created
- [ ] POST /api/v1/jobs/:jobId/reviews (job NOT closed) → 400
- [ ] POST /api/v1/jobs/:jobId/reviews (self-review) → 400
- [ ] POST /api/v1/jobs/:jobId/reviews (duplicate) → 409
- [ ] POST /api/v1/jobs/:jobId/reviews (rating=0) → 400
- [ ] POST /api/v1/jobs/:jobId/reviews (rating=6) → 400
- [ ] GET /api/v1/jobs/:jobId/reviews → reviews cho job
- [ ] GET /api/v1/users/:userId/reviews → reviews + summary + distribution
- [ ] Review tạo → rating_average + rating_count trên profile cập nhật đúng
- [ ] Frontend: /workers page hiển thị + filter + sort + pagination
- [ ] Frontend: /users/:id hiển thị public profile (worker với skills, reviews)
- [ ] Frontend: /users/:id hiển thị public profile (employer với stats)
- [ ] Frontend: /workers/profile cho phép edit profile + skills
- [ ] Frontend: Job detail (closed) hiển thị reviews + form tạo review
- [ ] Frontend: StarRating interactive hoạt động (click chọn sao)
- [ ] Frontend: review submit → hiển thị thành công
- [ ] Frontend: Navbar có link "Tìm Worker" + "Hồ sơ nghề nghiệp" (worker)
- [ ] Migrations chạy thành công (5 migration files)
- [ ] Seed skills chạy thành công
- [ ] npm run lint → pass
- [ ] npm run typecheck → pass
- [ ] npm test → pass
```

---

## 12. LƯU Ý QUAN TRỌNG

1. **Viết code THỰC** — compile được, chạy được, test được.
2. **Clean Architecture** — domain entities chứa business rules (Review validation), use cases orchestrate flow.
3. **Rating cached** — rating_average + rating_count cached trên worker_profiles VÀ users. Recalculate khi review mới, KHÔNG query aggregate mỗi request.
4. **Worker profile auto-create** — khi user role=worker register (hoặc lần đầu access /workers/me/profile) tự tạo record rỗng.
5. **Visibility rules** — worker chỉ hiện trong listing khi is_visible + có title + có skills. Public profile vẫn accessible nhưng hiện limited info nếu is_visible=false.
6. **Review immutable** — tạo xong không sửa/xóa ở M5.
7. **Self-review blocked** — constraint ở cả DB level (CHECK) VÀ application level.
8. **Skills max 15** — validate ở cả frontend và backend.
9. **Kế thừa M1→M4** — dùng lại auth middleware, error handling, validation, logging, Pagination, FilterSidebar pattern, URL sync pattern.
10. **SEO** — public profile page SSR với dynamic metadata (fullName, title làm page title).
