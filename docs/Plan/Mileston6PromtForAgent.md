# Implementation Prompt — Milestone 6: Gamification Ready

> **Dự án:** Gig Job Marketplace Web Platform
> **Milestone:** M6 – Gamification Ready
> **Ngày tạo:** 2026-03-12
> **Mục đích:** Prompt độc lập cho Claude B triển khai M6

---

Bạn là Senior Full-Stack Engineer. Nhiệm vụ: triển khai **Milestone 6 (Gamification Ready)** cho dự án "Gig Job Marketplace" — web platform kết nối người tìm việc gig và nhà tuyển dụng.

---

## 1. BỐI CẢNH DỰ ÁN

### Sản phẩm
Gig Job Marketplace Web Platform — nền tảng đăng việc gig, tìm việc, quản lý hồ sơ worker, đánh giá, gamification.

### Milestone roadmap
- M1 – Foundation Ready ✅
- M2 – User System Ready ✅
- M3 – Job Core Ready ✅
- M4 – Discovery Ready ✅
- M5 – Marketplace Ready ✅
- **M6 – Gamification Ready ← BẠN ĐANG LÀM CÁI NÀY**
- M7 – Production Ready
- M8 – Launch

### Những gì M1→M5 đã cung cấp (bạn kế thừa)

**Từ M1 — Foundation:**
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`
- Express + TypeScript, Clean Architecture 4 layers (domain, application, infrastructure, interface)
- Next.js 14+ App Router + TypeScript + Tailwind CSS
- PostgreSQL 16, Docker Compose, node-pg-migrate
- Winston logging + correlation ID, Sentry error tracking
- Global error handling, Zod validation middleware
- GitHub Actions CI

**Từ M2 — User System:**
- Auth: register, login, refresh (rotation), logout
- JWT access token (15m), httpOnly refresh cookie
- Auth middleware: `authenticate`, `authorize(...roles)`, `optionalAuth`
- User roles: `worker`, `employer`, `admin`
- User profile: GET/PATCH `/api/v1/users/me`

**Từ M3 — Job Core:**
- Job lifecycle: `draft → published → closed`
- Category reference data (10 categories)
- Job CRUD + publish/close, authorization rules

**Từ M4 — Discovery:**
- Public jobs listing: GET `/api/v1/jobs/public` (search/filter/sort/pagination)
- Home page, trending jobs, category listing, view_count

**Từ M5 — Marketplace:**
- Worker profile (`worker_profiles` bảng riêng, 1-1 users)
- Skills system (`skills` + `worker_skills` junction)
- Public profile: GET `/api/v1/users/:id/profile`
- Worker listing: GET `/api/v1/workers`
- Review system: POST `/api/v1/jobs/:jobId/reviews` (1-5 sao, gắn job closed)
- Aggregated rating cached trên `worker_profiles.rating_average/rating_count` và `users.rating_average/rating_count`

**Database hiện tại (sau M5):**

```sql
-- users (M2) — có rating_average, rating_count
-- refresh_tokens (M2)
-- categories (M3)
-- jobs (M3+M4) — có view_count
-- skills (M5)
-- worker_profiles (M5) — có rating_average, rating_count, jobs_completed
-- worker_skills (M5)
-- reviews (M5) — rating 1-5, optional comment, gắn job_id
```

**Hành động đã trackable từ M2-M5:**
- User register (M2)
- Job created, published, closed (M3)
- Profile updated (M2, M5)
- Worker skills updated (M5)
- Review created (M5)
- Job viewed (M4, via view_count)

---

## 2. TECH STACK BẮT BUỘC

- **Frontend**: Next.js 14+ (App Router), React, TypeScript strict, Tailwind CSS v3
- **Backend**: Node.js 20, Express.js, TypeScript strict
- **Database**: PostgreSQL 16 (pg driver, KHÔNG ORM)
- **Architecture**: Clean Architecture 4 layers, DDD, REST API
- **Mọi thứ khác**: kế thừa từ M1→M5

---

## 3. MỤC TIÊU MILESTONE M6

Xây dựng hệ thống gamification tạo động lực cho user:

1. **Points system** — điểm thưởng cho hành động tích cực trên platform
2. **Achievements** — huy hiệu/thành tựu khi đạt mốc nhất định
3. **Progress page** — trang hiển thị điểm, achievements, rank cá nhân
4. **Leaderboard** — bảng xếp hạng theo tuần và tháng

---

## 4. QUYẾT ĐỊNH KỸ THUẬT VÀ NGHIỆP VỤ ĐÃ CHỐT

### 4.1 Points System — Bảng điểm

**Hành động được tính điểm:**

| Hành động | Action Code | Điểm | Role | Cooldown/Limit | Mô tả |
|---|---|---|---|---|---|
| Hoàn thiện profile | `profile_completed` | +50 | worker | 1 lần duy nhất | Title + bio + avatar + ≥3 skills |
| Cập nhật profile | `profile_updated` | +5 | all | Max 1/ngày | Bất kỳ thay đổi nào |
| Đăng job mới | `job_published` | +20 | employer | — | Khi job được publish |
| Đóng job | `job_closed` | +10 | employer | — | Khi employer close job |
| Nhận review ≥4★ | `review_received_good` | +15 | all | — | Nhận review rating ≥ 4 |
| Nhận review bất kỳ | `review_received` | +5 | all | — | Nhận review rating bất kỳ |
| Viết review | `review_given` | +10 | all | — | Tạo review cho người khác |
| Đăng nhập hàng ngày | `daily_login` | +3 | all | Max 1/ngày | First login mỗi ngày |
| Cập nhật skills | `skills_updated` | +10 | worker | 1 lần duy nhất | Lần đầu thêm skills |

**Quy tắc:**
- Điểm chỉ CỘNG, không trừ (positive-only economy)
- Mỗi point transaction ghi lại log đầy đủ (ai, action, bao nhiêu điểm, khi nào, reference_id)
- Tổng điểm có 2 dạng: **all-time** (tích lũy) và **cycle** (theo tuần/tháng hiện tại)
- Anti-abuse: cooldown/limit per action per day

### 4.2 Achievement System

**Danh sách achievements MVP:**

| Achievement | Code | Tier | Điều kiện | Icon |
|---|---|---|---|---|
| **Newcomer** | `newcomer` | bronze | Hoàn thành đăng ký | 🌱 |
| **Profile Pro** | `profile_pro` | bronze | Hoàn thiện profile (title + bio + avatar + ≥3 skills) | 👤 |
| **First Job Posted** | `first_job_posted` | bronze | Đăng 1 job (employer) | 📝 |
| **Job Veteran** | `job_veteran` | silver | Đăng 10 jobs (employer) | 🏢 |
| **Job Champion** | `job_champion` | gold | Đăng 50 jobs (employer) | 🏆 |
| **First Review** | `first_review` | bronze | Viết 1 review | ✍️ |
| **Review Master** | `review_master` | silver | Viết 10 reviews | 📋 |
| **Rising Star** | `rising_star` | bronze | Nhận 1 review ≥ 4★ | ⭐ |
| **Top Rated** | `top_rated` | silver | Nhận 10 reviews trung bình ≥ 4.5★ | 🌟 |
| **Superstar** | `superstar` | gold | Nhận 25 reviews trung bình ≥ 4.5★ | 💫 |
| **Skill Collector** | `skill_collector` | bronze | Thêm ≥ 5 skills (worker) | 🧩 |
| **Skill Master** | `skill_master` | silver | Thêm ≥ 10 skills (worker) | 🎯 |
| **Loyal Member** | `loyal_member` | bronze | Đăng nhập 7 ngày liên tiếp | 📅 |
| **Dedicated** | `dedicated` | silver | Đăng nhập 30 ngày liên tiếp | 🔥 |
| **Century** | `century` | gold | Tích lũy 1000 points (all-time) | 💯 |

**Achievement tiers:**

| Tier | Color | Rarity |
|---|---|---|
| `bronze` | #CD7F32 | Common (dễ đạt) |
| `silver` | #C0C0C0 | Moderate (nỗ lực vừa) |
| `gold` | #FFD700 | Rare (nỗ lực lớn) |

**Architecture:**
- Achievements seeded vào DB: `achievement_definitions` table
- Khi point event xảy ra → evaluate tất cả achievements chưa unlocked của user đó
- Evaluation = check condition (SQL count/aggregate) ≥ threshold
- User achievements stored trong `user_achievements` table
- Progress tracking: ví dụ "3/10 jobs published" hiển thị trên UI

### 4.3 Leaderboard

| Hạng mục | Quyết định |
|---|---|
| **Chu kỳ** | Weekly (Thứ Hai → Chủ Nhật) và Monthly (ngày 1 → cuối tháng) |
| **Cách tính** | Tổng points earned trong chu kỳ |
| **Hiển thị** | Top 20 users + vị trí current user |
| **Phân loại** | 1 leaderboard chung (overall). Extension point cho worker/employer split |
| **Tie-breaking** | Cùng điểm → xếp theo user đạt điểm đó sớm hơn (earlier = higher rank) |
| **Reset** | Điểm leaderboard = points earned trong chu kỳ. Cycle kết thúc → bắt đầu chu kỳ mới từ 0 |
| **Snapshot** | Lưu leaderboard snapshot cuối mỗi chu kỳ (history) |
| **Minimum** | User cần ≥ 1 point trong chu kỳ để xuất hiện trong leaderboard |

**Cách tính real-time (không dùng snapshot real-time):**
```sql
-- Top 20 weekly leaderboard
SELECT u.id, u.full_name, u.avatar_url, u.role,
       SUM(pt.points) as cycle_points
FROM point_transactions pt
  JOIN users u ON pt.user_id = u.id
WHERE pt.created_at >= date_trunc('week', NOW())
  AND pt.created_at < date_trunc('week', NOW()) + INTERVAL '7 days'
GROUP BY u.id, u.full_name, u.avatar_url, u.role
HAVING SUM(pt.points) > 0
ORDER BY cycle_points DESC, MIN(pt.created_at) ASC
LIMIT 20;
```

### 4.4 Event Trigger Strategy

| Strategy | Quyết định |
|---|---|
| **Mechanism** | **Synchronous hooks trong use cases** (không dùng message queue ở MVP) |
| **Cách hoạt động** | Sau khi use case hoàn thành action chính → gọi `GamificationService.handleEvent(event)` |
| **GamificationService** | 1. Award points → 2. Evaluate achievements → 3. Trả kết quả (points earned + achievements unlocked) |
| **Extension point** | Có thể migrate sang event bus/queue ở M7+ nếu cần async |

**Events cần hook:**
- `user.registered` → award `daily_login` points + evaluate `newcomer` achievement
- `user.profile_updated` → award `profile_updated` points + evaluate `profile_pro`
- `user.daily_login` → award `daily_login` points + evaluate `loyal_member`, `dedicated`
- `job.published` → award `job_published` points + evaluate `first_job_posted`, `job_veteran`, `job_champion`
- `job.closed` → award `job_closed` points
- `review.created` → award `review_given` to reviewer + `review_received` / `review_received_good` to reviewee + evaluate review achievements
- `worker.skills_updated` → award `skills_updated` points + evaluate `skill_collector`, `skill_master`

### 4.5 Anti-Abuse Rules

| Rule | Implementation |
|---|---|
| Daily point cap | Max 100 points/user/day |
| Action cooldown | `profile_updated`: max 1/day, `daily_login`: max 1/day |
| One-time actions | `profile_completed`, `skills_updated`: chỉ award 1 lần (check point_transactions) |
| Rate limit API | Endpoints gamification rate limited (30 req/min) |
| No self-gaming | Points chỉ award qua hành động thật, không có API "claim points" |

### 4.6 Progress Page — Nội dung

| Section | Dữ liệu |
|---|---|
| **Points Summary** | All-time points, weekly points, monthly points |
| **Current Rank** | Vị trí trong weekly + monthly leaderboard |
| **Achievements** | Tất cả achievements (unlocked + locked + progress bar) |
| **Point History** | 20 transactions gần nhất (action, points, timestamp) |
| **Activity Stats** | Jobs posted/completed, reviews given/received, current streak |

---

## 5. DATABASE SCHEMA CẦN TRIỂN KHAI

### 5.1 Migration: Bảng `point_transactions`

```sql
-- Migration: 012_create-point-transactions-table.sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_code VARCHAR(50) NOT NULL,
  points INT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_points_positive CHECK (points > 0)
);

CREATE INDEX idx_point_tx_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_tx_user_created ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_tx_action ON point_transactions(action_code);
CREATE INDEX idx_point_tx_created_at ON point_transactions(created_at);
-- Index cho leaderboard queries
CREATE INDEX idx_point_tx_weekly ON point_transactions(created_at, user_id) WHERE created_at >= date_trunc('week', NOW());
```

### 5.2 Migration: Bảng `user_points_summary` (cached totals)

```sql
-- Migration: 013_create-user-points-summary-table.sql
CREATE TABLE user_points_summary (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  weekly_points INT NOT NULL DEFAULT 0,
  monthly_points INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_login_date DATE,
  last_points_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.3 Migration: Bảng `achievement_definitions` (seed)

```sql
-- Migration: 014_create-achievement-definitions-table.sql
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  tier VARCHAR(10) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  condition_threshold INT NOT NULL,
  condition_query TEXT,
  points_reward INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_tier CHECK (tier IN ('bronze', 'silver', 'gold')),
  CONSTRAINT chk_threshold CHECK (condition_threshold > 0)
);

CREATE INDEX idx_achievement_def_code ON achievement_definitions(code);
CREATE INDEX idx_achievement_def_active ON achievement_definitions(is_active);
```

### 5.4 Migration: Bảng `user_achievements`

```sql
-- Migration: 015_create-user-achievements-table.sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);
```

### 5.5 Migration: Bảng `leaderboard_snapshots`

```sql
-- Migration: 016_create-leaderboard-snapshots-table.sql
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_type VARCHAR(10) NOT NULL,
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  rank INT NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_cycle_type CHECK (cycle_type IN ('weekly', 'monthly')),
  CONSTRAINT uq_snapshot UNIQUE (cycle_type, cycle_start, user_id)
);

CREATE INDEX idx_leaderboard_cycle ON leaderboard_snapshots(cycle_type, cycle_start, rank);
```

### 5.6 Seed: Achievement Definitions

```sql
INSERT INTO achievement_definitions (code, name, description, icon, tier, condition_type, condition_threshold, display_order) VALUES
  ('newcomer', 'Newcomer', 'Chào mừng đến với Gig Marketplace!', '🌱', 'bronze', 'user_registered', 1, 1),
  ('profile_pro', 'Profile Pro', 'Hoàn thiện hồ sơ chuyên nghiệp', '👤', 'bronze', 'profile_completed', 1, 2),
  ('first_job_posted', 'First Job', 'Đăng việc đầu tiên', '📝', 'bronze', 'jobs_published_count', 1, 3),
  ('job_veteran', 'Job Veteran', 'Đăng 10 việc trên platform', '🏢', 'silver', 'jobs_published_count', 10, 4),
  ('job_champion', 'Job Champion', 'Đăng 50 việc trên platform', '🏆', 'gold', 'jobs_published_count', 50, 5),
  ('first_review', 'First Review', 'Viết đánh giá đầu tiên', '✍️', 'bronze', 'reviews_given_count', 1, 6),
  ('review_master', 'Review Master', 'Viết 10 đánh giá', '📋', 'silver', 'reviews_given_count', 10, 7),
  ('rising_star', 'Rising Star', 'Nhận đánh giá tốt đầu tiên (≥4★)', '⭐', 'bronze', 'good_reviews_received', 1, 8),
  ('top_rated', 'Top Rated', 'Nhận 10 đánh giá với trung bình ≥4.5★', '🌟', 'silver', 'high_rated_reviews', 10, 9),
  ('superstar', 'Superstar', 'Nhận 25 đánh giá với trung bình ≥4.5★', '💫', 'gold', 'high_rated_reviews', 25, 10),
  ('skill_collector', 'Skill Collector', 'Thêm 5 kỹ năng vào hồ sơ', '🧩', 'bronze', 'skills_count', 5, 11),
  ('skill_master', 'Skill Master', 'Thêm 10 kỹ năng vào hồ sơ', '🎯', 'silver', 'skills_count', 10, 12),
  ('loyal_member', 'Loyal Member', 'Đăng nhập 7 ngày liên tiếp', '📅', 'bronze', 'login_streak', 7, 13),
  ('dedicated', 'Dedicated', 'Đăng nhập 30 ngày liên tiếp', '🔥', 'silver', 'login_streak', 30, 14),
  ('century', 'Century', 'Tích lũy 1000 điểm', '💯', 'gold', 'total_points', 1000, 15)
ON CONFLICT (code) DO NOTHING;
```

---

## 6. REST API ENDPOINTS CẦN TRIỂN KHAI

### 6.1 Progress / My Gamification

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/gamification/me` | ✅ | Progress page data: points, rank, achievements, stats |

**Response:**
```json
{
  "success": true,
  "data": {
    "points": {
      "total": 350,
      "weekly": 45,
      "monthly": 120
    },
    "rank": {
      "weekly": { "position": 5, "totalParticipants": 42 },
      "monthly": { "position": 3, "totalParticipants": 78 }
    },
    "streak": {
      "current": 5,
      "longest": 12
    },
    "achievements": {
      "unlocked": [
        { "id": "uuid", "code": "newcomer", "name": "Newcomer", "icon": "🌱", "tier": "bronze", "unlockedAt": "..." }
      ],
      "locked": [
        { "id": "uuid", "code": "job_veteran", "name": "Job Veteran", "icon": "🏢", "tier": "silver", "progress": { "current": 3, "target": 10 } }
      ]
    },
    "stats": {
      "jobsPublished": 3,
      "reviewsGiven": 2,
      "reviewsReceived": 5,
      "skillsCount": 7
    }
  }
}
```

### 6.2 Point History

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/gamification/me/points` | ✅ | Lịch sử điểm của user |

**Query params:** `page` (default 1), `limit` (default 20, max 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "actionCode": "job_published",
        "actionLabel": "Đăng việc mới",
        "points": 20,
        "referenceId": "job-uuid",
        "referenceType": "job",
        "createdAt": "2026-03-12T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

### 6.3 Achievements List

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/gamification/achievements` | ❌ | Tất cả achievements (public gallery) |

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      { "id": "uuid", "code": "newcomer", "name": "Newcomer", "description": "...", "icon": "🌱", "tier": "bronze" }
    ]
  }
}
```

### 6.4 Leaderboard

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/gamification/leaderboard` | `optionalAuth` | Bảng xếp hạng |

**Query params:**
- `cycle`: `weekly` (default), `monthly`

**Response:**
```json
{
  "success": true,
  "data": {
    "cycle": {
      "type": "weekly",
      "startDate": "2026-03-10",
      "endDate": "2026-03-16"
    },
    "rankings": [
      {
        "rank": 1,
        "user": { "id": "uuid", "fullName": "Nguyễn Văn A", "avatarUrl": null, "role": "worker" },
        "points": 150
      }
    ],
    "currentUser": {
      "rank": 5,
      "points": 45
    },
    "totalParticipants": 42
  }
}
```

### 6.5 API hook: Gamification Event (Internal)

Không phải public endpoint — GamificationService được gọi nội bộ từ use cases:

```typescript
interface GamificationResult {
  pointsAwarded: number;
  achievementsUnlocked: Achievement[];
}

interface GamificationService {
  handleEvent(event: GamificationEvent): Promise<GamificationResult>;
}

type GamificationEvent = {
  type: string;  // 'job.published', 'review.created', etc.
  userId: string;
  data?: Record<string, any>;
};
```

---

## 7. BACKEND IMPLEMENTATION CHI TIẾT

### 7.1 Domain Layer

```
domain/
├── entities/
│   ├── ...existing...
│   ├── PointTransaction.ts        # MỚI
│   ├── Achievement.ts             # MỚI
│   └── UserAchievement.ts         # MỚI
├── value-objects/
│   ├── ...existing...
│   ├── AchievementTier.ts         # MỚI: bronze/silver/gold
│   └── ActionCode.ts              # MỚI: enum các action codes
├── repositories/
│   ├── ...existing...
│   ├── IPointRepository.ts        # MỚI
│   └── IAchievementRepository.ts  # MỚI
└── errors/
    ├── ...existing...
    ├── DailyPointCapError.ts      # MỚI
    └── ActionCooldownError.ts     # MỚI
```

**IPointRepository:**
```typescript
interface IPointRepository {
  createTransaction(tx: PointTransaction): Promise<PointTransaction>;
  getUserTotalPoints(userId: string): Promise<number>;
  getUserCyclePoints(userId: string, cycle: 'weekly' | 'monthly'): Promise<number>;
  getPointHistory(userId: string, page: number, limit: number): Promise<PaginatedResult<PointTransaction>>;
  getDailyPointsTotal(userId: string, date: Date): Promise<number>;
  hasActionToday(userId: string, actionCode: string): Promise<boolean>;
  hasActionEver(userId: string, actionCode: string): Promise<boolean>;
  getLeaderboard(cycle: 'weekly' | 'monthly', limit: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: string, cycle: 'weekly' | 'monthly'): Promise<{ rank: number; totalParticipants: number } | null>;
  updateUserSummary(userId: string): Promise<void>;
}
```

**IAchievementRepository:**
```typescript
interface IAchievementRepository {
  findAllDefinitions(activeOnly?: boolean): Promise<Achievement[]>;
  findUserAchievements(userId: string): Promise<UserAchievement[]>;
  findUnlockedByUser(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  isUnlocked(userId: string, achievementId: string): Promise<boolean>;
  getProgress(userId: string, achievement: Achievement): Promise<{ current: number; target: number }>;
}
```

### 7.2 Application Layer

```
application/
├── use-cases/
│   ├── gamification/
│   │   ├── GetProgressUseCase.ts            # MỚI
│   │   ├── GetPointHistoryUseCase.ts        # MỚI
│   │   ├── GetLeaderboardUseCase.ts         # MỚI
│   │   └── ListAchievementsUseCase.ts       # MỚI
│   └── ...existing use cases (CẬP NHẬT: hook gamification events)
├── services/
│   └── GamificationService.ts               # MỚI: core orchestrator
└── dtos/
    ├── ...existing...
    ├── ProgressDTO.ts                        # MỚI
    ├── LeaderboardDTO.ts                     # MỚI
    └── PointTransactionDTO.ts               # MỚI
```

**GamificationService — Core Logic:**
```typescript
class GamificationService {
  async handleEvent(event: GamificationEvent): Promise<GamificationResult> {
    // 1. Determine points to award
    const pointConfig = this.getPointConfig(event.type);
    if (!pointConfig) return { pointsAwarded: 0, achievementsUnlocked: [] };

    // 2. Check anti-abuse rules
    const canAward = await this.checkCooldown(event.userId, pointConfig);
    if (!canAward) return { pointsAwarded: 0, achievementsUnlocked: [] };

    // 3. Check daily cap
    const dailyTotal = await this.pointRepo.getDailyPointsTotal(event.userId, new Date());
    if (dailyTotal + pointConfig.points > 100) return { pointsAwarded: 0, achievementsUnlocked: [] };

    // 4. Create point transaction
    const tx = await this.pointRepo.createTransaction({...});

    // 5. Update user summary
    await this.pointRepo.updateUserSummary(event.userId);

    // 6. Evaluate achievements
    const unlocked = await this.evaluateAchievements(event.userId);

    return { pointsAwarded: pointConfig.points, achievementsUnlocked: unlocked };
  }
}
```

**Cập nhật existing use cases (hook events):**

Các use case từ M2→M5 cần thêm dòng cuối:
```typescript
// Ví dụ PublishJobUseCase (M3)
async execute(input) {
  // ...existing logic...
  const job = await this.jobRepo.update(job);
  logger.info('job.published', { jobId: job.id });

  // MỚI: gamification hook
  await this.gamificationService.handleEvent({
    type: 'job.published',
    userId: job.createdBy,
    data: { jobId: job.id }
  });

  return job;
}
```

### 7.3 Infrastructure Layer

```
infrastructure/
├── repositories/
│   ├── ...existing...
│   ├── PostgresPointRepository.ts       # MỚI
│   └── PostgresAchievementRepository.ts # MỚI
├── services/
│   └── GamificationServiceImpl.ts       # MỚI
└── database/
    ├── migrations/
    │   ├── 012_create-point-transactions-table.sql
    │   ├── 013_create-user-points-summary-table.sql
    │   ├── 014_create-achievement-definitions-table.sql
    │   ├── 015_create-user-achievements-table.sql
    │   └── 016_create-leaderboard-snapshots-table.sql
    └── seeds/
        └── 005_seed-achievement-definitions.ts
```

**Achievement progress evaluation — SQL examples:**
```sql
-- jobs_published_count
SELECT COUNT(*) FROM jobs WHERE created_by = $1 AND status IN ('published', 'closed');

-- reviews_given_count
SELECT COUNT(*) FROM reviews WHERE reviewer_id = $1;

-- good_reviews_received (rating >= 4)
SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND rating >= 4;

-- skills_count
SELECT COUNT(*) FROM worker_skills ws
  JOIN worker_profiles wp ON ws.worker_profile_id = wp.id
  WHERE wp.user_id = $1;

-- login_streak (from user_points_summary)
SELECT current_streak FROM user_points_summary WHERE user_id = $1;

-- total_points
SELECT total_points FROM user_points_summary WHERE user_id = $1;
```

### 7.4 Interface Layer

```
interface/http/
├── routes/
│   └── gamification.routes.ts     # MỚI
├── controllers/
│   └── GamificationController.ts  # MỚI
└── validators/
    └── gamification.validators.ts # MỚI
```

### 7.5 Daily Login Tracking

Cập nhật login flow (LoginUseCase từ M2):
```typescript
// Sau login thành công:
// 1. Check last_login_date vs today
// 2. Nếu khác ngày → fire daily_login event
// 3. Update current_streak: nếu last_login_date = yesterday → streak + 1, otherwise → reset to 1
// 4. Update longest_streak nếu current > longest
```

---

## 8. FRONTEND IMPLEMENTATION CHI TIẾT

### 8.1 Pages/Routes cần có

| Route | Page | Auth | Mô tả |
|---|---|---|---|
| `/progress` | Progress Page | ✅ | Điểm, achievements, rank cá nhân |
| `/leaderboard` | Leaderboard | ❌ | Bảng xếp hạng tuần/tháng |

### 8.2 Components

```
components/
├── gamification/
│   ├── PointsSummary.tsx           # MỚI: card tổng điểm (total, weekly, monthly)
│   ├── PointHistory.tsx            # MỚI: danh sách point transactions
│   ├── AchievementCard.tsx         # MỚI: card 1 achievement (icon, name, unlocked/locked)
│   ├── AchievementGrid.tsx         # MỚI: grid tất cả achievements
│   ├── AchievementProgress.tsx     # MỚI: progress bar (3/10 jobs)
│   ├── AchievementBadge.tsx        # MỚI: badge nhỏ hiện trên profile/navbar
│   ├── AchievementToast.tsx        # MỚI: toast notification khi unlock achievement
│   ├── LeaderboardTable.tsx        # MỚI: bảng xếp hạng
│   ├── LeaderboardCycleSelector.tsx # MỚI: toggle weekly/monthly
│   ├── RankBadge.tsx               # MỚI: badge vị trí leaderboard (#1 🥇, #2 🥈, #3 🥉)
│   ├── StreakDisplay.tsx           # MỚI: hiển thị login streak 🔥5 days
│   └── PointsEarnedPopup.tsx       # MỚI: popup "+20 points!" sau action
└── shared/
    └── ...existing...
```

### 8.3 Progress Page Layout

```
┌───────────────────────────────────────────┐
│ 🎮 TIẾN ĐỘ CỦA BẠN                      │
├────────────┬────────────┬─────────────────┤
│ 💰 350pts  │ 📅 45pts   │ 📆 120pts       │
│ Tổng điểm  │ Tuần này   │ Tháng này       │
├────────────┴────────────┴─────────────────┤
│ 🏆 RANKING                                │
│ Weekly: #5 / 42   |   Monthly: #3 / 78    │
│ 🔥 5 ngày liên tiếp                       │
├───────────────────────────────────────────┤
│ ⭐ THÀNH TỰU (5/15)                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 🌱   │ │ 👤   │ │ ✍️   │ │ ⭐   │      │
│ │Newco │ │Prof  │ │First │ │Rising│      │
│ │  ✅  │ │  ✅  │ │  ✅  │ │  ✅  │      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐ ┌──────────────┐       │
│ │ 🏢   │ │ 📋   │ │   🧩 Skill   │       │
│ │Job   │ │Review│ │ ██░░░ 3/5    │       │
│ │Vet🔒│ │Mast🔒│ │     🔒       │       │
│ └──────┘ └──────┘ └──────────────┘       │
├───────────────────────────────────────────┤
│ 📝 LỊCH SỬ ĐIỂM GẦN ĐÂY                 │
│ +20  Đăng việc mới       2 giờ trước      │
│ +10  Viết đánh giá       5 giờ trước      │
│ +3   Đăng nhập hàng ngày Hôm nay          │
│ +15  Nhận review tốt     Hôm qua          │
│ [Xem thêm]                                │
└───────────────────────────────────────────┘
```

### 8.4 Leaderboard Page Layout

```
┌───────────────────────────────────────────┐
│ 🏆 BẢNG XẾP HẠNG                         │
│ [Tuần này ✓] [Tháng này]                  │
│ 10/03/2026 — 16/03/2026                   │
├───┬──────────────────────┬────────────────┤
│ # │ User                 │ Điểm           │
├───┼──────────────────────┼────────────────┤
│🥇│ Nguyễn Văn A [Avatar]│ 150 pts        │
│🥈│ Trần Thị B   [Avatar]│ 130 pts        │
│🥉│ Lê Văn C     [Avatar]│ 115 pts        │
│ 4 │ Phạm D       [Avatar]│ 95 pts         │
│ 5 │ ⭐ Bạn       [Avatar]│ 45 pts         │
│...│                      │                │
│20 │ Hoàng G      [Avatar]│ 12 pts         │
├───┴──────────────────────┴────────────────┤
│ 👥 42 người tham gia tuần này             │
└───────────────────────────────────────────┘
```

### 8.5 Gamification UI Interactions

- **Achievement toast:** khi use case trả `achievementsUnlocked.length > 0` → hiển thị toast celebration
- **Points popup:** khi action tạo points → hiển thị "+20pts 🎯" animation nhỏ
- **Navbar badge:** hiển thị tổng points / streak bên cạnh avatar

### 8.6 Cập nhật Navigation

- Thêm link "Tiến độ" / "🎮" → `/progress` (authenticated only)
- Thêm link "Xếp hạng" → `/leaderboard` (public)
- Navbar: hiện points badge (⭐ 350) bên cạnh avatar

---

## 9. PHẠM VI KHÔNG LÀM (OUT OF SCOPE M6)

- ❌ Points redemption (đổi điểm lấy rewards) → sau
- ❌ Custom achievements (admin tạo) → sau
- ❌ Achievement sharing trên social media → sau
- ❌ Badges hiển thị trên public profile (chỉ progress page) → có thể thêm dễ
- ❌ Push notifications cho achievements → sau
- ❌ Leaderboard theo category/skill → sau
- ❌ Team/company leaderboard → sau
- ❌ Seasonal events/challenges → sau
- ❌ Message queue cho events (dùng synchronous hooks) → M7 nếu cần

---

## 10. YÊU CẦU OUTPUT CỦA BẠN

### Thứ tự triển khai đề xuất:
1. Database migrations (6 tables)
2. Seed achievement definitions
3. Domain layer (entities, value objects, repository interfaces, errors)
4. GamificationService core logic
5. Application layer (use cases)
6. Infrastructure layer (repository implementations)
7. Interface layer — Backend (routes, controllers, validators)
8. Hook gamification events vào existing use cases (M2-M5)
9. Frontend components
10. Progress page
11. Leaderboard page
12. Navbar updates (points badge)
13. Achievement toast + points popup
14. Testing

### Checklist kiểm tra M6 Done

```
- [ ] Migrations chạy thành công (5 migration files)
- [ ] Seed achievements chạy thành công (15 definitions)
- [ ] POST job publish → user nhận +20 points
- [ ] POST review → reviewer nhận +10, reviewee nhận +5 (hoặc +15 nếu ≥4★)
- [ ] Login → +3 points (max 1/day)
- [ ] Profile update → +5 points (max 1/day)
- [ ] Daily point cap 100 hoạt động (action vượt cap → không award)
- [ ] One-time action (profile_completed) chỉ award 1 lần
- [ ] GET /api/v1/gamification/me → points + rank + achievements + stats
- [ ] GET /api/v1/gamification/me/points → point history + pagination
- [ ] GET /api/v1/gamification/achievements → tất cả achievements
- [ ] GET /api/v1/gamification/leaderboard?cycle=weekly → top 20 + current user
- [ ] GET /api/v1/gamification/leaderboard?cycle=monthly → top 20
- [ ] Leaderboard tie-breaking hoạt động (cùng điểm → earlier rank higher)
- [ ] Achievement auto-unlock khi đạt condition (e.g. publish 1 job → newcomer + first_job_posted)
- [ ] Achievement progress đúng (3/10 jobs)
- [ ] Login streak tracking đúng (liên tiếp +1, gián đoạn reset)
- [ ] Frontend: /progress hiển thị points, rank, achievements, history
- [ ] Frontend: /leaderboard hiển thị ranking tuần/tháng
- [ ] Frontend: Achievement toast khi unlock mới
- [ ] Frontend: Points popup khi earn points
- [ ] Frontend: Navbar hiển thị points badge
- [ ] Frontend: Achievement locked/unlocked/progress states
- [ ] npm run lint → pass
- [ ] npm run typecheck → pass
- [ ] npm test → pass
```

---

## 11. LƯU Ý QUAN TRỌNG

1. **Synchronous hooks** — GamificationService gọi trực tiếp trong use cases, không async queue ở M6.
2. **Cached summary** — `user_points_summary` update sau mỗi point transaction, KHÔNG aggregate mỗi request.
3. **Anti-abuse trước** — implement cooldown + daily cap TRƯỚC khi hook vào use cases.
4. **Achievement evaluation lazy** — chỉ evaluate khi có event, không cron job.
5. **Leaderboard real-time** — query `point_transactions` trực tiếp cho real-time ranking. Snapshot chỉ cho lịch sử.
6. **Kế thừa M1→M5** — dùng lại auth middleware, error handling, Pagination component, patterns.
7. **Idempotent points** — cùng action + reference_id → không award lại (check trước khi insert).
