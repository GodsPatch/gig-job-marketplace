# Gig Job Marketplace

> Nền tảng web kết nối người tìm việc gig và nhà tuyển dụng.

## 📋 Prerequisites

- **Node.js** 20+ LTS
- **npm** 10+
- **Docker** & Docker Compose
- **Git**

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd gig-job-marketplace
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Start Database

```bash
docker compose up -d
```

Wait for PostgreSQL to be healthy:
```bash
docker compose ps  # Should show "healthy"
```

### 4. Run Migrations

```bash
npm run migrate:up -w apps/api
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:api   # Backend on http://localhost:4000
npm run dev:web   # Frontend on http://localhost:3000
```

### 6. Verify

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Should return: { "success": true, "data": { "status": "healthy", ... } }
```

## 🏗️ Architecture

### Monorepo Structure

```
├── apps/
│   ├── api/          # Backend — Express + TypeScript + Clean Architecture
│   └── web/          # Frontend — Next.js 14 + React + Tailwind CSS
├── packages/
│   └── shared/       # Shared types & constants
├── docs/             # Documentation
├── docker-compose.yml
├── package.json      # Root workspace config
└── tsconfig.base.json
```

### Backend — Clean Architecture (4 Layers)

```
apps/api/src/
├── domain/           # Enterprise Business Rules (entities, value objects, repo interfaces)
├── application/      # Application Business Rules (use cases, DTOs, service interfaces)
├── infrastructure/   # Frameworks & Drivers (DB, logging, config, error tracking)
├── interface/        # Interface Adapters (HTTP routes, controllers, middlewares)
└── shared/           # Cross-cutting concerns (constants, utils)
```

**Dependency rule:** Domain ← Application ← Infrastructure/Interface

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS v3 |
| Backend | Node.js 20, Express.js, TypeScript |
| Database | PostgreSQL 16 |
| Architecture | Clean Architecture, Domain Driven Design, REST API |
| Monorepo | npm workspaces |
| Validation | Zod |
| Security | Helmet, express-rate-limit, CORS, bcrypt |
| Logging | Winston (structured JSON, correlation ID) |
| Caching | node-cache (in-memory) |
| Testing | Jest, Supertest, React Testing Library |
| CI/CD | GitHub Actions |

## 📜 Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run dev:api` | Start backend only |
| `npm run dev:web` | Start frontend only |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run all tests |
| `npm run typecheck` | TypeScript type checking |

### Backend (`apps/api`)

| Script | Description |
|--------|-------------|
| `npm run migrate:up -w apps/api` | Run pending migrations |
| `npm run migrate:down -w apps/api` | Rollback last migration |
| `npm run migrate:create -w apps/api -- <name>` | Create new migration |
| `npm run seed -w apps/api` | Run database seeds |

### Database Backup

```bash
# Backup
./scripts/backup-db.sh

# Restore (interactive — requires confirmation)
./scripts/restore-db.sh <backup_file>
```

## 🔌 API Endpoints

### Health Check
- `GET /api/v1/health` — Basic health (uptime, DB status)
- `GET /api/v1/health/deep` — Deep health (DB, pool stats, memory)

### Auth
- `POST /api/v1/auth/register` — User registration
- `POST /api/v1/auth/login` — Login (returns tokens)
- `POST /api/v1/auth/refresh` — Refresh access token
- `POST /api/v1/auth/logout` — Logout (revoke token)

### Users
- `GET /api/v1/users/me` — Get current user profile
- `PATCH /api/v1/users/me` — Update profile

### Jobs
- `POST /api/v1/jobs` — Create job (employer/admin)
- `GET /api/v1/jobs/me` — List own jobs
- `GET /api/v1/jobs/public` — Public job search (filter, sort, paginate)
- `GET /api/v1/jobs/:slug` — Job detail by slug
- `PATCH /api/v1/jobs/:id` — Edit draft job
- `POST /api/v1/jobs/:id/publish` — Publish job
- `POST /api/v1/jobs/:id/close` — Close job

### Categories & Skills
- `GET /api/v1/categories` — List categories with job count
- `GET /api/v1/categories/:slug` — Category by slug
- `GET /api/v1/skills` — List all skills

### Workers
- `GET /api/v1/workers` — Search workers (public)
- `GET /api/v1/workers/me/profile` — My worker profile
- `PATCH /api/v1/workers/me/profile` — Update worker profile
- `PUT /api/v1/workers/me/skills` — Set worker skills

### Reviews
- `POST /api/v1/jobs/:jobId/reviews` — Create review
- `GET /api/v1/jobs/:jobId/reviews` — List job reviews
- `GET /api/v1/users/:userId/reviews` — List user reviews

### Public Profiles
- `GET /api/v1/users/:userId/profile` — Public user profile

### Gamification
- `GET /api/v1/gamification/me` — My progress (points, achievements)
- `GET /api/v1/gamification/me/points` — Point history
- `GET /api/v1/gamification/achievements` — All achievements
- `GET /api/v1/gamification/leaderboard` — Leaderboard

## 🔒 Security (M7)

- **Helmet** — Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — Origin whitelist, explicit methods/headers
- **Rate Limiting** — Per-route rate limits (auth, search, creation)
- **Input Sanitization** — ILIKE wildcard escaping, Zod validation
- **Body Size Limit** — 1MB max JSON payload
- **SQL Injection** — 100% parameterized queries
- **DB Timeout** — 10s statement timeout

## 📦 Milestone Roadmap

- [x] **M1** — Foundation Ready
- [x] **M2** — User System Ready
- [x] **M3** — Job Core Ready
- [x] **M4** — Discovery Ready
- [x] **M5** — Marketplace Ready
- [x] **M6** — Gamification Ready
- [x] **M7** — Production Ready
- [ ] **M8** — Launch

## 📄 License

Private — All rights reserved.
