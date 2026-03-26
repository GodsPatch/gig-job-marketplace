# Hướng dẫn Deploy Production — Step by Step

> Hướng dẫn chi tiết cho người mới. Mỗi bước có hình dung rõ ràng.

---

## Tổng quan kiến trúc Deploy

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Browser   │────▶│  Vercel (Frontend)   │────▶│  DO App Platform    │
│  User truy  │     │  gigmarketplace.vn   │     │  api.gigmarketplace │
│  cập web    │     │  Next.js             │     │  Express API        │
└─────────────┘     └──────────────────────┘     └────────┬────────────┘
                                                          │
                                                 ┌────────▼────────────┐
                                                 │  DO Managed Postgres│
                                                 │  PostgreSQL 16      │
                                                 └─────────────────────┘
```

**Chi phí ước tính:**
- Vercel: **$0** (free tier, 100GB bandwidth/tháng)
- DigitalOcean App Platform: **$5-12/tháng** (basic tier)
- DO Managed PostgreSQL: **$15/tháng** (basic-1vcpu-1gb)
- Domain `.vn`: **~350k VNĐ/năm**
- **Tổng: ~$20-27/tháng** (~500k-700k VNĐ)

---

## BƯỚC 1: Đẩy code lên GitHub (nếu chưa có)

### 1.1 Tạo GitHub repository

1. Vào [github.com/new](https://github.com/new)
2. Đặt tên: `gig-job-marketplace`
3. Chọn **Private**
4. Click **Create repository**

### 1.2 Push code

```bash
# Trong thư mục project
cd C:\Coding\GodsAgentPatchv0

# Khởi tạo git (nếu chưa)
git init
git remote add origin https://github.com/YOUR_USERNAME/gig-job-marketplace.git

# Push code
git add .
git commit -m "feat: complete M1-M8 implementation"
git branch -M main
git push -u origin main
```

> ⚠️ **QUAN TRỌNG:** Kiểm tra file `.gitignore` đã có các dòng sau:
> ```
> .env
> .env.*
> !.env.example
> !.env.production.example
> node_modules/
> dist/
> .next/
> ```

---

## BƯỚC 2: Setup DigitalOcean (Backend + Database)

### 2.1 Tạo tài khoản

1. Vào [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click **Sign Up** → đăng ký bằng email hoặc GitHub
3. Nhập thẻ tín dụng/PayPal (bắt buộc, nhưng có **$200 credit free** cho 60 ngày)

### 2.2 Tạo Managed PostgreSQL Database

1. Trong DO Dashboard → sidebar trái → click **Databases**
2. Click **Create Database Cluster**
3. Cấu hình:
   - **Engine:** PostgreSQL **16**
   - **Region:** Singapore (SGP1) — gần Việt Nam nhất
   - **Plan:** Basic → **$15/mo** (1 vCPU, 1GB RAM, 10GB disk)
   - **Name:** `gig-marketplace-db`
4. Click **Create Database Cluster**
5. Đợi 3-5 phút để DB khởi tạo

### 2.3 Lấy Connection String

1. Vào database vừa tạo → tab **Overview**
2. Phần **Connection details** → dropdown chọn **Connection string**
3. Copy connection string, dạng:
   ```
   postgresql://doadmin:XXXXX@db-postgresql-sgp1-xxxxx.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```
4. **Lưu lại** connection string này (cần dùng ở bước sau)

### 2.4 Tạo database name

1. Trong trang DB → tab **Users & Databases**
2. Phần **Databases** → click **Add Database**
3. Nhập: `gig_marketplace`
4. Click **Save**
5. Quay lại **Overview** → chọn database `gig_marketplace` ở dropdown
6. Copy lại connection string mới (đã trỏ đến `gig_marketplace`)

### 2.5 Chạy Migrations trên Production DB

```bash
# Mở terminal, set DATABASE_URL
# (thay bằng connection string thật ở bước 2.3)
$env:DATABASE_URL = "postgresql://doadmin:XXXXX@db-host:25060/gig_marketplace?sslmode=require"

# Chạy migrations
npm run migrate:up -w apps/api

# Chạy seed data (categories, skills, achievements)
npm run seed -w apps/api
```

### 2.6 Deploy Backend lên App Platform

1. DO Dashboard → sidebar → **App Platform** → **Create App**
2. **Source:** GitHub → connect GitHub account → chọn repo `gig-job-marketplace`
3. **Branch:** `main`
4. DO sẽ tự detect → chọn **Dockerfile** hoặc **Node.js**
   - Nếu chọn Node.js:
     - **Build command:** `npm ci && cd apps/api && npm run build`
     - **Run command:** `cd apps/api && npm run start`
5. **Resources:** Basic → **$5/mo** (512MB) hoặc **$12/mo** (1GB)
6. **Environment Variables** → click **Edit** → thêm:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | `(paste connection string bước 2.3)` |
| `DB_HOST` | `(host từ connection string)` |
| `DB_PORT` | `25060` |
| `DB_NAME` | `gig_marketplace` |
| `DB_USER` | `doadmin` |
| `DB_PASSWORD` | `(password từ connection string)` — đánh dấu **Encrypt** |
| `JWT_SECRET` | `(tạo bằng lệnh bên dưới)` — **Encrypt** |
| `REFRESH_TOKEN_SECRET` | `(tạo bằng lệnh bên dưới)` — **Encrypt** |
| `CORS_ORIGIN` | `https://your-domain.com` |
| `FRONTEND_URL` | `https://your-domain.com` |
| `LOG_LEVEL` | `info` |

Tạo JWT secrets:
```bash
# Chạy trong terminal để tạo secret ngẫu nhiên
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
# Chạy 2 lần — 1 cho JWT_SECRET, 1 cho REFRESH_TOKEN_SECRET
```

7. **HTTP Port:** `4000`
8. Click **Create Resources** → đợi deploy (5-10 phút)
9. Sau khi deploy xong → copy URL app (dạng `https://gig-marketplace-api-xxxxx.ondigitalocean.app`)
10. Test: mở trình duyệt → `https://YOUR-APP-URL/api/v1/health`
    - Nếu thấy `{"success": true, ...}` → ✅ Backend OK!

---

## BƯỚC 3: Setup Vercel (Frontend)

### 3.1 Tạo tài khoản

1. Vào [vercel.com](https://vercel.com)
2. Click **Sign Up** → chọn **Continue with GitHub**
3. Authorize Vercel truy cập GitHub

### 3.2 Import Project

1. Dashboard → click **Add New...** → **Project**
2. Chọn repo `gig-job-marketplace` → click **Import**
3. Cấu hình:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** click **Edit** → nhập `apps/web`
   - **Build Command:** `cd ../.. && npm ci && cd apps/web && npm run build`
     (hoặc để default nếu Vercel detect được)
   - **Output Directory:** `.next`
4. **Environment Variables** → thêm:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-DO-APP-URL` (URL từ bước 2.9) |

5. Click **Deploy** → đợi 2-5 phút
6. Sau khi xong → Vercel cho URL dạng `https://gig-job-marketplace.vercel.app`
7. Mở URL → thấy trang web → ✅ Frontend OK!

---

## BƯỚC 4: Mua Domain + Cấu hình DNS (Tùy chọn)

> Bước này không bắt buộc cho testing. Bạn có thể dùng URL mặc định của Vercel + DO.

### 4.1 Mua domain

- **Tên miền .vn:** [tenten.vn](https://tenten.vn), [matbao.net](https://matbao.net), [inet.vn](https://inet.vn)
- **Tên miền .com:** [namecheap.com](https://namecheap.com), [cloudflare.com/registrar](https://cloudflare.com/registrar)
- Ví dụ: `gigmarketplace.vn` hoặc `gigmarket.com`

### 4.2 Cấu hình DNS cho Frontend (Vercel)

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Nhập domain: `gigmarketplace.vn` → **Add**
3. Vercel sẽ hiện DNS records cần thêm, ví dụ:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

4. Vào trang quản lý domain (tenten/namecheap) → **DNS Management** → thêm records trên
5. Đợi DNS propagate (15 phút - 48 giờ, thường 15-30 phút)
6. Vercel tự cấp SSL (HTTPS) → ✅ `https://gigmarketplace.vn` hoạt động

### 4.3 Cấu hình DNS cho Backend API

1. DO Dashboard → App → **Settings** → **Domains**
2. Click **Add Domain** → nhập `api.gigmarketplace.vn`
3. DO hiện CNAME record cần thêm:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `api` | `gig-marketplace-api-xxxxx.ondigitalocean.app` |

4. Thêm CNAME record này vào DNS manager
5. Đợi propagate
6. ✅ `https://api.gigmarketplace.vn/api/v1/health` hoạt động

### 4.4 Cập nhật CORS và API URL

Sau khi có domain thật, cập nhật:

**Backend (DO App Platform → Environment Variables):**
```
CORS_ORIGIN=https://gigmarketplace.vn
FRONTEND_URL=https://gigmarketplace.vn
```

**Frontend (Vercel → Environment Variables):**
```
NEXT_PUBLIC_API_URL=https://api.gigmarketplace.vn
```

→ Redeploy cả hai sau khi đổi env vars.

---

## BƯỚC 5: Cấu hình GitHub Secrets

Cần cho deploy pipeline (`deploy-production.yml`).

### 5.1 Lấy DigitalOcean API Token

1. DO Dashboard → sidebar trái cuối → **API**
2. Click **Generate New Token**
3. Name: `github-deploy`
4. Scopes: **Full Access**
5. Click **Generate** → **Copy** token ngay (chỉ hiện 1 lần!)

### 5.2 Lấy Vercel Token

1. Vào [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create**
3. Name: `github-deploy`, Scope: chọn project
4. Click **Create** → copy token

### 5.3 Lấy Vercel Project Info

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (chạy trong thư mục project)
vercel link

# Xem org ID và project ID
cat .vercel/project.json
# Output: {"orgId": "xxx", "projectId": "yyy"}
```

### 5.4 Thêm Secrets vào GitHub

1. GitHub → repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** → thêm từng secret:

| Secret Name | Value |
|---|---|
| `DIGITALOCEAN_ACCESS_TOKEN` | (token từ bước 5.1) |
| `VERCEL_TOKEN` | (token từ bước 5.2) |
| `VERCEL_ORG_ID` | (orgId từ bước 5.3) |
| `VERCEL_PROJECT_ID` | (projectId từ bước 5.3) |

---

## BƯỚC 6: Test Deploy Pipeline

1. GitHub → repo → tab **Actions**
2. Sidebar trái → click **"Deploy to Production"**
3. Click **"Run workflow"** → nhập `deploy-production` → click **Run workflow**
4. Theo dõi pipeline:
   - ✅ Validate
   - ✅ Full CI Check
   - ✅ Deploy Backend
   - ✅ Deploy Frontend
   - ✅ Smoke Tests
5. Nếu tất cả green → 🎉 Deploy thành công!

---

## BƯỚC 7: Setup Monitoring

### 7.1 UptimeRobot (Free)

1. Vào [uptimerobot.com](https://uptimerobot.com) → Sign Up (free)
2. Click **Add New Monitor** → tạo 2 monitors:

**Monitor 1:**
- Type: HTTP(s)
- Friendly Name: `API Health`
- URL: `https://api.gigmarketplace.vn/api/v1/health`
- Monitoring Interval: 5 minutes

**Monitor 2:**
- Type: HTTP(s)
- Friendly Name: `Frontend`
- URL: `https://gigmarketplace.vn`
- Monitoring Interval: 5 minutes

3. Alert Contacts → thêm email của bạn

### 7.2 Sentry (Free tier)

1. Vào [sentry.io](https://sentry.io) → Sign Up
2. Create Organization → tên: `gig-marketplace`
3. Create Project → platform: **Node.js** → tên: `api`
4. Copy **DSN** (dạng `https://xxx@o123.ingest.sentry.io/456`)
5. Paste DSN vào DO App Platform env vars: `SENTRY_DSN=<dsn>`
6. Tạo thêm 1 project cho Frontend: platform **Next.js** → copy DSN
7. Paste vào Vercel env vars: `NEXT_PUBLIC_SENTRY_DSN=<dsn>`

---

## BƯỚC 8: UAT & Launch! 🚀

### 8.1 Test thủ công

Mở website production → test theo [UAT Checklist](../Launch/uat-checklist.md):
- ☐ Register → Login → View profile
- ☐ Create job → Publish → Search
- ☐ Worker profile → Reviews
- ☐ Gamification → Leaderboard
- ☐ Mobile responsive

### 8.2 Pre-launch

Chạy qua [Pre-launch Checklist](../Launch/pre-launch-checklist.md) — đảm bảo tất cả items đều ✅.

### 8.3 Launch!

Khi tất cả OK → thông báo stakeholders → 🚀 **LIVE!**

---

## Troubleshooting Thường Gặp

### "npm run build" lỗi trên DO
→ Kiểm tra **Build Command** có đúng không: `npm ci && cd apps/api && npm run build`

### Frontend gọi API bị CORS error
→ Kiểm tra `CORS_ORIGIN` trên backend = đúng URL frontend (có `https://`, không có `/` cuối)

### Database connection refused
→ Kiểm tra:
- `DATABASE_URL` có `?sslmode=require`
- DB cluster đã tạo xong chưa (status: Online)
- Trusted Sources trong DB settings cho phép App Platform kết nối

### Deploy pipeline failed ở "Full CI Check"
→ Push code fix lên `main` trước, rồi re-run workflow

### "Permission denied" khi push code
→ Kiểm tra bạn đã setup SSH key hoặc Personal Access Token cho GitHub chưa
