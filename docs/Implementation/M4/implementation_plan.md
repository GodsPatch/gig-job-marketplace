# Implementation Plan — Milestone 4: Discovery Ready

## Goal

Triển khai Milestone 4 (Discovery Ready) tập trung vào trải nghiệm khám phá và tìm kiếm việc làm cho anonymous và signed-in users. Chức năng chính bao gồm trang chủ M4, tìm kiếm từ khóa với ILIKE, lọc công việc nâng cao (giá, loại hình, danh mục), sắp xếp (trending, newest), và đồng bộ trạng thái tìm kiếm với URL.

Tích hợp sát với Workflow `[/search-filter]` (Quy trình query động từ DB tới UI) và `[/frontend-ui]` (Quy trình code UI độc lập hiện đại).

## Architecture & Workflows

### Phase 1: Database Layer & Indexes (Workflow: `[/database]`, `[/search-filter]`)
- [x] Migration `006_add-view-count-to-jobs.sql`:
  - Thêm cột `view_count INT DEFAULT 0` vào bảng `jobs`.
  - Đánh index cho `view_count DESC`.
  - Partial composite index cho discovery: `ON jobs(status, published_at DESC, view_count DESC) WHERE status = 'published'`.
  - GIN Index (tùy chọn theo spec) cho full-text search fallback.
- [x] Seeds `003_seed-sample-jobs.ts`:
  - Auto-generate ~30 published jobs trải đều các danh mục, có location/budget đa dạng và view count ngẫu nhiên để test UX.

### Phase 2: Domain Layer
- [x] Entity `Job.ts`: Thêm `viewCount` property.
- [x] Repositories `IJobRepository.ts`: Khai báo `findPublished(filters: PublicJobFilters)` và `incrementViewCount(jobId)`.
- [x] Repositories `ICategoryRepository.ts`: Khai báo `findAllWithJobCount()`.

### Phase 3: Application Layer (Business Logic)
- [x] DTOs: `PublicJobFiltersDTO.ts`, `CategoryWithCountDTO.ts`.
- [x] Use Cases `SearchPublicJobsUseCase.ts`: Xử lý validate parameters, tính toán filter object cho public search.
- [x] Use Cases `IncrementViewCountUseCase.ts`: Xử lý logic tăng view count an toàn.
- [x] Use Cases `ListCategoriesUseCase.ts`: Nâng cấp tích hợp `jobCount`.
- [x] Use Cases `GetCategoryDetailUseCase.ts`: Fetch thông tin chi tiết của danh mục kèm số lượng việc.
- [x] Cập nhật `GetJobDetailUseCase.ts`: Kích hoạt increment view count tĩnh (nếu user không phải chủ job).

### Phase 4: Infrastructure Layer (Complex Queries) (Workflow: `[/search-filter]`)
- [x] Repositories `PostgresJobRepository.ts`: Triển khai `findPublished` sử dụng Parameterized Query an toàn (tránh Injection). Logic ILIKE keyword chia từ khóa (AND condition). Subquery logic tính `trending_score = view_count + recency_bonus`.
- [x] Repositories `PostgresCategoryRepository.ts`: Bổ sung `COUNT() FILTER (WHERE status = 'published')` cho `findAllWithJobCount`.

### Phase 5: Interface Layer (API endpoints) (Workflow: `[/backend-api]`)
- [x] Validators: `job.validators.ts` bổ sung `publicSearchSchema` hỗ trợ check `budgetMin`, `budgetMax`, `locationType`, `sort` v.v.
- [x] Controllers `JobController.ts`: Bổ sung `searchPublic`. Đảm bảo map đúng params từ UI.
- [x] Routes `job.routes.ts`: Đặt `GET /api/v1/jobs/public` TRƯỚC param wildcard `/:slug`.
- [x] Controllers & Routes `CategoryController.ts`: Nâng cấp endpoint trả về count jobs.

### Phase 6: Frontend State & Hooks (Workflow: `[/search-filter]`)
- [x] Nâng cấp API Clients `jobs.api.ts` & `categories.api.ts` với endpoint public search.
- [x] Hook `useJobSearch.ts`: Bi-directional state & URL sync dùng `useSearchParams` và `usePathname`. Debounce cho text inputs để không spam API backend.

### Phase 7: Frontend UI & Components (Workflow: `[/frontend-ui]`, `[/search-filter]`)
- [x] Shared Discovery Components: `SearchBar`, `FilterSidebar`, `FilterChips`, `SortSelect`, `SearchResultHeader`.
- [x] Public Page `app/page.tsx` (Trang chủ): Thiết kế Hero Search, Top Trending Jobs, Latest Jobs, Category Grid, và CTA block. (SSR/ISR).
- [x] Public Page `app/jobs/page.tsx`: Cập nhật thành view hai cột Sidebar Filter & JobListingGrid.
- [x] Public Page `app/categories/[slug]/page.tsx`: Cập nhật layout Category Header + Job Listing dưới đó.

### Phase 8: QA, Performance & Testing (Workflow: `[/testing]`, `[/search-filter]`)
- [x] DB Performance: Đảm bảo search response < 500ms đối với list tổng hợp. (EXPLAIN query).
- [x] Chạy Automation tests nội bộ/Manual Test: Kiểm tra các combination parameters, boundary values cho budget ranges.
- [x] E2E check (Web App Testing): Validate responsive UI, đặc biệt collapse Sidebar trên Mobile. Validate Next.js URL tracking correctly when refreshing page. Mở port kiểm thử bằng browser Playwright / Screenshot.
