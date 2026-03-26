# UAT Checklist — Gig Job Marketplace

> **Purpose:** Tài liệu để Stakeholders verify tất cả tính năng trước khi launch.  
> **Pass Criteria:** 0 critical/major bugs, ≥ 95% scenarios passed, pages load < 3s.

---

## Auth & User (M2)

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 1 | Register | Email + password + name → Submit | Account created, redirect to login | ☐ |
| 2 | Register duplicate | Email đã tồn tại → Submit | Error: email đã được sử dụng | ☐ |
| 3 | Login | Email + password đúng | Login success, see dashboard | ☐ |
| 4 | Login wrong password | Password sai | Error: thông tin không đúng | ☐ |
| 5 | View profile | Navigate to /profile | See user info | ☐ |
| 6 | Edit profile | Change name, bio → Save | Profile updated | ☐ |
| 7 | Logout | Click logout | Session ended | ☐ |
| 8 | Session refresh | Wait 15+ min, interact | Auto refresh, no re-login | ☐ |

## Job Core (M3)

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 9 | Create job | Fill form → Save draft | Job created as draft | ☐ |
| 10 | Edit draft | Modify fields → Save | Draft updated | ☐ |
| 11 | Publish job | Click publish on valid draft | Status → published | ☐ |
| 12 | Publish invalid | Missing required fields → Publish | Error with details | ☐ |
| 13 | Close job | Close published job | Status → closed | ☐ |
| 14 | View own jobs | Navigate to /jobs/me | See all own jobs | ☐ |
| 15 | View published job | Navigate to /jobs/:slug (public) | See job detail | ☐ |
| 16 | View draft (non-owner) | Navigate to draft job slug | 404 | ☐ |

## Discovery (M4)

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 17 | Home page | Navigate to / | See hero, trending, categories, latest | ☐ |
| 18 | Search keyword | Type keyword → search | Relevant results | ☐ |
| 19 | Filter by category | Select category | Filtered results | ☐ |
| 20 | Filter by location | Select remote/onsite | Filtered results | ☐ |
| 21 | Sort by budget | Sort budget desc | Sorted correctly | ☐ |
| 22 | Pagination | Navigate pages | Correct pages | ☐ |
| 23 | URL sync | Copy URL with filters → new tab | Same filters/results | ☐ |
| 24 | Category page | Navigate /categories/:slug | Category jobs listing | ☐ |
| 25 | Empty search | Search gibberish keyword | Empty state message | ☐ |

## Marketplace (M5)

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 26 | Edit worker profile | Update title, skills, rate | Profile saved | ☐ |
| 27 | Worker listing | Navigate /workers | See workers with filters | ☐ |
| 28 | Public profile (worker) | View /users/:id | See skills, rating, reviews | ☐ |
| 29 | Public profile (employer) | View /users/:id | See jobs posted, rating | ☐ |
| 30 | Create review | On closed job → submit review | Review created | ☐ |
| 31 | Duplicate review | Try review same job again | Error: already reviewed | ☐ |
| 32 | Rating display | Check profile after review | Rating updated | ☐ |

## Gamification (M6)

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 33 | Earn points | Publish job → check points | +20 points earned | ☐ |
| 34 | View progress | Navigate /progress | Points, achievements, rank | ☐ |
| 35 | Achievement unlock | Meet condition | Achievement badge unlocked | ☐ |
| 36 | Leaderboard | Navigate /leaderboard | Rankings displayed | ☐ |
| 37 | Point history | View in progress page | Transaction history | ☐ |
| 38 | Login streak | Login consecutive days | Streak counter increases | ☐ |

## Cross-cutting

| # | Scenario | Steps | Expected | Pass? |
|---|---|---|---|---|
| 39 | Mobile responsive | Test on mobile viewport | All pages usable | ☐ |
| 40 | Loading states | Slow network simulation | Skeleton/spinner shown | ☐ |
| 41 | Error handling | API error simulation | Error message, retry option | ☐ |
| 42 | Navigation | Click through all nav links | All pages load correctly | ☐ |

---

## Bug Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| **Critical** | App unusable, data loss, security breach | Login broken, SQL injection |
| **Major** | Feature broken, significant UX issue | Search wrong results, review not saving |
| **Minor** | Cosmetic, minor UX, workaround exists | Text alignment, typo, minor styling |

## Sign-off

| Item | Status |
|---|---|
| **Tester Name** | ___________________ |
| **Test Date** | ___________________ |
| **Total Passed** | _____ / 42 |
| **Critical Bugs** | _____ (must be 0) |
| **Major Bugs** | _____ (must be 0) |
| **Minor Bugs** | _____ (≤ 5 acceptable) |
| **Go / No-Go** | ☐ GO &nbsp;&nbsp; ☐ NO-GO |
| **Sign-off** | ___________________ |
