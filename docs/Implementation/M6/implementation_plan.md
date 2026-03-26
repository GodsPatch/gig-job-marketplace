# Milestone 6: Gamification Ready — Implementation Plan

> **Mục tiêu:** Xây dựng hệ thống gamification tạo động lực cho user (Points, Achievements, Leaderboard, Progress).
> **Ngày tạo:** 2026-03-25
> **Trạng thái:** 🔵 In Progress

---

## Tổng quan Architecture

Hệ thống Gamification M6 thêm 5 bảng mới trong database (`point_transactions`, `user_points_summary`, `achievement_definitions`, `user_achievements`, `leaderboard_snapshots`). Kiến trúc sử dụng **Synchronous hooks** được gọi từ các Use Cases có sẵn (M2-M5) thông qua `GamificationService` để award points và đánh giá achievements ngay lập tức. Cần áp dụng quy tắc Anti-Abuse (Daily cap, Cooldown) nghiêm ngặt. Frontend sẽ thêm trang `/progress` và `/leaderboard`.

---

## Phase 1: Database Migrations & Seeds
- [ ] Migration `012_create-point-transactions-table.sql`: Lịch sử cộng điểm.
- [ ] Migration `013_create-user-points-summary-table.sql`: Tổng hợp điểm (cached totals, current_streak).
- [ ] Migration `014_create-achievement-definitions-table.sql`: Định nghĩa thành tựu (tên, icon, điều kiện).
- [ ] Migration `015_create-user-achievements-table.sql`: Lưu trữ thành tựu user đã mở khóa.
- [ ] Migration `016_create-leaderboard-snapshots-table.sql`: Lưu snapshot leaderboard theo chu kỳ.
- [ ] Seed `005_seed-achievement-definitions.ts`: 15 achievements.
- [ ] Chạy migrations + seed thành công.

## Phase 2: Domain Layer (Entities, Value Objects, Errors)
- [ ] Entity `PointTransaction.ts`: id, userId, actionCode, points, referenceId.
- [ ] Entity `Achievement.ts`: code, name, description, tier, conditionType, threshold.
- [ ] Entity `UserAchievement.ts`: userId, achievementId, unlockedAt.
- [ ] Value Objects: `AchievementTier` (bronze, silver, gold), `ActionCode` (enum các hành động).
- [ ] Domain errors: `DailyPointCapError`, `ActionCooldownError`.
- [ ] Repository interfaces: `IPointRepository`, `IAchievementRepository`.

## Phase 3: Application Layer & Core Service
- [ ] DTOs: `ProgressDTO`, `LeaderboardDTO`, `PointTransactionDTO`.
- [ ] Service `GamificationService`: `handleEvent(event)` - xử lý rules, limits, cap, award point, eval achievements.
- [ ] Use Case `GetProgressUseCase`: Lấy tổng điểm, rank, danh sách thành tựu (unlocked/locked), stats.
- [ ] Use Case `GetPointHistoryUseCase`: Lấy lịch sử giao dịch điểm phân trang.
- [ ] Use Case `GetLeaderboardUseCase`: Lấy top 20 users the tuần/tháng.
- [ ] Use Case `ListAchievementsUseCase`: Danh sách achievement (public gallery).

## Phase 4: Infrastructure Layer (Repositories)
- [ ] `PostgresPointRepository.ts`: createTransaction, getTotals, getDailyPoints, getLeaderboard.
- [ ] `PostgresAchievementRepository.ts`: findAllDefinitions, findUserAchievements, getProgress.
- [ ] `GamificationServiceImpl.ts`: Cụ thể hóa interface GamificationService.

## Phase 5: Interface Layer (API Routes & Hooks)
- [ ] Cập nhật `LoginUseCase` (M2): check `last_login_date` và tính `current_streak`.
- [ ] Hook `GamificationService` vào M2: Register, Update Profile.
- [ ] Hook `GamificationService` vào M3: Publish Job, Close Job.
- [ ] Hook `GamificationService` vào M5: Update Skills, Create Review.
- [ ] Validators: `gamification.validators.ts` cho các GET params.
- [ ] Controllers: `GamificationController.ts` kết nối với các use cases.
- [ ] Routes: `gamification.routes.ts` được mount vào `/api/v1/gamification`.

## Phase 6: Frontend Types & API Clients
- [ ] Types: Interface cho Points, Rank, Achievements, LeaderboardEntry.
- [ ] API clients: `gamification.api.ts` (getMe, getHistory, getAchievements, getLeaderboard).

## Phase 7: Frontend Components (Gamification)
- [ ] `PointsSummary.tsx`: Card hiển thị tổng điểm, tuần, tháng.
- [ ] `PointHistory.tsx`: List 20 transactions gần nhất.
- [ ] `AchievementGrid.tsx`, `AchievementCard.tsx`, `AchievementProgress.tsx`.
- [ ] `LeaderboardTable.tsx`, `LeaderboardCycleSelector.tsx`.
- [ ] `RankBadge.tsx`, `StreakDisplay.tsx`, `AchievementBadge.tsx`.
- [ ] `PointsEarnedPopup.tsx`, `AchievementToast.tsx`: Visual feedback dạng toast.
- [ ] Cập nhật `Navbar.tsx`: Hiện points badge/streak cạnh avatar.

## Phase 8: Frontend Pages
- [ ] `/progress` page (Auth): Layout dashboard hiển thị cá nhân, tổng điểm, stats, achievements, point history.
- [ ] `/leaderboard` page (Public): Hiển thị rankings theo weekly/monthly.

## Phase 9: QA & Verification
- [ ] `npm run typecheck` pass cả api + web.
- [ ] Verify Anti-Abuse (max 100 điểm/ngày, cooldown per action hoạt động).
- [ ] E2E Playwright: Login, Submit action (e.g., publish job), check points popup, check leaderboard.
