# Implementation Plan - Milestone 3 (Job Core Ready)

Tiến trình triển khai M3 theo đúng yêu cầu từ `Mileston3PromtForAgent.md`.
Trạng thái hoàn thành sẽ được đánh dấu `[x]` ngay khi Agent execute dứt điểm từng phần để tiện theo dõi lưu vết.

## Phase 1: Database & Seed (Workflow: `/database`)
- [x] Migration: Tạo bảng `categories` (004).
- [x] Migration: Tạo bảng `jobs` (005).
- [x] Seed data: Viết script nạp danh mục mẫu cho bảng `categories`.

## Phase 2: Domain Layer (Workflow: `/business-logic`)
- [x] Entities: `Job.ts`, `Category.ts`.
- [x] Value Objects: `JobStatus.ts`, `BudgetType.ts`, `LocationType.ts`, `Slug.ts`.
- [x] Domain Errors: `JobNotFoundError`, `JobNotEditableError`, `JobNotPublishableError`, `InvalidStateTransitionError`, v.v.
- [x] Repository Interfaces: `IJobRepository`, `ICategoryRepository`.
- [x] Unit Tests: Test logic chuyển đổi state (publish, close, edit) của Job entity.

## Phase 3: Application Layer
- [x] Interfaces: `ISlugService`.
- [x] DTOs: `CreateJobDTO`, `UpdateJobDTO`, `JobResponseDTO`, `JobListFiltersDTO`.
- [x] Use Cases (Job): `CreateJob`, `UpdateJob`, `PublishJob`, `CloseJob`, `GetJobDetail`, `ListOwnerJobs`.
- [x] Use Cases (Category): `ListCategories`.

## Phase 4: Infrastructure Layer
- [x] External Services: `SlugService.ts`.
- [x] Repositories: `PostgresCategoryRepository.ts`.
- [x] Repositories: `PostgresJobRepository.ts`.

## Phase 5: Interface Layer (API)
- [x] Middlewares: `optionalAuth.ts`.
- [x] Validators: `category.validators.ts`, `job.validators.ts`.
- [x] Controllers: `CategoryController.ts`, `JobController.ts`.
- [x] Routes: `category.routes.ts`, `job.routes.ts` (và mount vào `index.ts`).

## Phase 6: Frontend Infrastructure & Components (Workflow: `/frontend-ui`)
- [x] Types & API Client: `types/job.ts`, `jobs.api.ts`, `categories.api.ts`.
- [x] Shared UI: `Pagination`, `EmptyState`, `JobStatusBadge`, `BudgetDisplay`.
- [x] Category UI: `CategoryMenu`, `CategorySelect`.
- [x] Job UI: `JobForm`, `JobCard`, `JobDetail`, `JobManagementTable`, `JobActions`.

## Phase 7: Frontend Pages (Workflow: `/fullstack-feature`)
- [x] Page: `/jobs/create` (Employer/Admin only).
- [x] Page: `/my-jobs/[id]/edit` (Employer/Admin only).
- [x] Page: `/my-jobs` (Employer dashboard).
- [x] Page: `/[slug]` (Public job details).
- [x] Page: `/jobs` (Public job list).management list).
- [x] UX/UI Integration: Cập nhật Navbar hiển thị link "Đăng việc" & "Quản lý Jobs" theo Role.

## Phase 8: QA & Testing (Workflow: `/testing`)
- [x] Chạy `npm run lint` và `npm run typecheck` trên Next.js (apps/web).
- [x] Manual test luồng tạo Job (Draft) -> Hiện ở bảng quản lý.
- [x] Manual test luồng Publish Job -> Hiện ở public jobs list.
- [x] Add walkthrough.md.uyệt.
