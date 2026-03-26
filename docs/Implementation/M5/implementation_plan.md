# Milestone 5: Marketplace Ready — Implementation Plan

> **Mục tiêu:** Biến platform từ "đăng việc một chiều" thành marketplace hai chiều: Worker Profile, Skills, Public Profile, Review/Rating system.
> **Ngày tạo:** 2026-03-24
> **Trạng thái:** 🔵 In Progress

---

## Tổng quan Architecture

M5 thêm 4 bảng mới (skills, worker_profiles, worker_skills, reviews) + alter users. 3 domain entities mới (WorkerProfile, Skill, Review). 8 use cases mới. 4 route modules mới. 5 trang frontend mới/cập nhật.

---

## Phase 1: Database Migrations & Seeds
- [ ] Migration `007_create-skills-table.sql`: Bảng skills (id, name, slug, category_id, is_active)
- [ ] Migration `008_create-worker-profiles-table.sql`: Bảng worker_profiles (1-1 users, title, hourly_rate, availability, rating cache...)
- [ ] Migration `009_create-worker-skills-table.sql`: Junction table worker_skills (composite PK)
- [ ] Migration `010_create-reviews-table.sql`: Bảng reviews (job_id, reviewer_id, reviewee_id, rating 1-5, UNIQUE per job+reviewer)
- [ ] Migration `011_add-rating-to-users.sql`: ALTER users ADD rating_average, rating_count
- [ ] Seed `004_seed-skills.ts`: 29 skills phân theo categories đã có
- [ ] Chạy migrations + seed thành công

## Phase 2: Domain Layer (Entities, Value Objects, Errors)
- [ ] Entity `WorkerProfile.ts`: title, hourlyRate, experienceYears, availability, isVisible, rating cache
- [ ] Entity `Skill.ts`: name, slug, categoryId, isActive
- [ ] Entity `Review.ts`: jobId, reviewerId, revieweeId, rating(1-5), comment. Static `validateCanReview()`
- [ ] Value Object `Availability.ts`: enum available/busy/unavailable
- [ ] Value Object `Rating.ts`: validate 1-5 integer
- [ ] Domain errors: WorkerProfileNotFoundError, ReviewNotAllowedError, DuplicateReviewError, JobNotClosedError, SkillLimitExceededError
- [ ] Repository interfaces: IWorkerProfileRepository, ISkillRepository, IReviewRepository

## Phase 3: Application Layer (Use Cases & DTOs)
- [ ] DTOs: WorkerProfileDTO, SkillDTO, ReviewDTO, PublicProfileDTO, WorkerListFiltersDTO
- [ ] `GetMyWorkerProfileUseCase`: Lấy profile worker (auto-create nếu chưa có)
- [ ] `UpdateWorkerProfileUseCase`: PATCH title, hourlyRate, experienceYears, availability, portfolioUrl, isVisible
- [ ] `UpdateWorkerSkillsUseCase`: PUT replace toàn bộ skills (max 15, validate exists + active)
- [ ] `ListSkillsUseCase`: Danh sách skills active grouped by category
- [ ] `SearchWorkersUseCase`: Search/filter workers visible (keyword, skillIds, availability, hourlyRate range, rating, experience, sort, pagination)
- [ ] `GetPublicProfileUseCase`: Worker profile + skills + reviews HOẶC Employer stats + reviews
- [ ] `CreateReviewUseCase`: Validate job closed, not self, not duplicate → create + recalculate rating cache
- [ ] `ListJobReviewsUseCase`: Reviews cho 1 job
- [ ] `ListUserReviewsUseCase`: Reviews nhận được + summary + distribution

## Phase 4: Infrastructure Layer (Repository Implementations)
- [ ] `PostgresWorkerProfileRepository.ts`: findByUserId, create, update, findVisible (complex query), updateRating
- [ ] `PostgresSkillRepository.ts`: findAll, findByIds, findByCategoryId
- [ ] `PostgresReviewRepository.ts`: create, findByJobId, findByRevieweeId (paginated + join), findByReviewerAndJob, getAverageRating, getRatingDistribution

## Phase 5: Interface Layer — Backend (Routes, Controllers, Validators)
- [ ] Validators: worker.validators.ts, review.validators.ts
- [ ] Controllers: WorkerController (GET/PATCH me/profile, PUT me/skills), SkillController (GET /skills)
- [ ] Controllers: ReviewController (POST /jobs/:jobId/reviews, GET /jobs/:jobId/reviews, GET /users/:userId/reviews)
- [ ] Controllers: PublicProfileController (GET /users/:id/profile)
- [ ] Routes: worker.routes.ts, skill.routes.ts, review.routes.ts, publicProfile.routes.ts
- [ ] Mount routes vào routes/index.ts
- [ ] Auto-create worker_profile khi register (hook vào RegisterUseCase)

## Phase 6: Frontend Types & API Clients
- [ ] Types: WorkerProfile, Skill, Review, PublicProfile interfaces trong `types/`
- [ ] API clients: workers.api.ts, skills.api.ts, reviews.api.ts update

## Phase 7: Frontend Components
- [ ] `StarRating.tsx`: Interactive stars (click chọn) + display mode
- [ ] `RatingDisplay.tsx`: Average display (4.5/5 ★★★★☆)
- [ ] `RatingDistribution.tsx`: Bar chart phân bổ 1-5 sao
- [ ] `ReviewForm.tsx`: Stars + comment textarea + submit
- [ ] `ReviewCard.tsx`: Hiển thị 1 review (stars, comment, reviewer info, job title)
- [ ] `ReviewList.tsx`: Danh sách reviews + pagination
- [ ] `WorkerCard.tsx`: Card worker trong listing (avatar, title, skills, rating, rate)
- [ ] `WorkerFilterSidebar.tsx`: Filters cho worker listing (skills multi-select, availability, rate range)
- [ ] `AvailabilityBadge.tsx`: Badge available/busy/unavailable
- [ ] `SkillsSelector.tsx`: Multi-select skills tag input (max 15)
- [ ] `WorkerProfileForm.tsx`: Form edit worker profile
- [ ] `PublicProfileHeader.tsx`: Header profile (avatar, name, title, rating)

## Phase 8: Frontend Pages
- [x] `/workers` page: Worker listing (search, filter sidebar, grid, pagination, URL sync)
- [x] `/users/[id]` page: Public profile (worker vs employer layouts, reviews section)
- [x] `/workers/profile` page: Worker profile edit (form + skills selector)
- [x] Cập nhật `/jobs/[slug]`: Thêm review section nếu job closed
- [x] Cập nhật Navbar: Link "Tìm Worker", "Hồ sơ nghề nghiệp" cho worker

## Phase 9: QA & Verification
- [x] `npm run typecheck` pass cả api + web
- [x] Migrations + seed chạy clean
- [x] Manual test API endpoints (curl/REST)
- [x] Verify rating cache recalculation logic

---

## Ghi chú kỹ thuật
- Worker profile auto-create khi register (role=worker) hoặc khi GET /workers/me/profile lần đầu
- Rating cached trên worker_profiles (worker) VÀ users (employer). Recalculate khi review mới.
- Review immutable — không sửa/xóa ở M5
- Skills max 15 — validate cả FE + BE
- Worker chỉ hiện listing khi is_visible + có title + có ≥1 skill
