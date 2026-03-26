# Deploy MIỄN PHÍ — Hướng dẫn Step-by-Step

> Deploy online hoàn toàn miễn phí bằng **Vercel** + **Render** + **Neon**.  
> Ai cũng xem được qua link. Phù hợp demo, portfolio, học tập.

---

## Tổng quan

```
┌──────────┐     ┌───────────────────┐     ┌────────────────────┐
│ Browser  │────▶│  Vercel (FREE)    │────▶│  Render.com (FREE) │
│          │     │  Frontend Next.js │     │  Backend Express   │
└──────────┘     └───────────────────┘     └────────┬───────────┘
                                                     │
                                            ┌────────▼───────────┐
                                            │  Neon.tech (FREE)  │
                                            │  PostgreSQL 16     │
                                            └────────────────────┘
```

| Service | Free Tier | Hạn chế |
|---|---|---|
| **Vercel** | Unlimited deploys, 100GB bandwidth | Hobby plan, không custom domain cho team |
| **Render** | 750 giờ/tháng | Spin down sau 15 phút idle (cold start ~30s) |
| **Neon** | 0.5 GB storage, 190 giờ compute | Auto-suspend sau 5 phút idle |
| **Tổng** | **$0/tháng** | Chậm lần đầu do cold start, đủ dùng demo |

---

## BƯỚC 0: Chuẩn bị

### 0.1 Đảm bảo code đã hoạt động local

```bash
# Chạy thử local trước
cd C:\Coding\GodsAgentPatchv0
npm run dev
```

Mở `http://localhost:3000` — nếu chạy được → OK tiếp!

### 0.2 Push code lên GitHub

```bash
cd C:\Coding\GodsAgentPatchv0

# Nếu chưa kết nối GitHub
git init
git remote add origin https://github.com/YOUR_USERNAME/gig-job-marketplace.git

# Kiểm tra .gitignore (QUAN TRỌNG - không push secrets!)
# Đảm bảo có: .env, node_modules/, dist/, .next/

git add .
git commit -m "feat: ready for deployment"
git branch -M main
git push -u origin main
```

---

## BƯỚC 1: Tạo Database trên Neon (5 phút)

### 1.1 Đăng ký

1. Vào **[neon.tech](https://neon.tech)** → click **Sign Up**
2. Chọn **Continue with GitHub** (nhanh nhất)
3. Chọn plan **Free** → Continue

### 1.2 Tạo Project

1. Click **Create Project**
2. Cấu hình:
   - **Project name:** `gig-marketplace`
   - **Region:** `Asia Pacific (Singapore)` ← quan trọng, chọn gần VN
   - **PostgreSQL version:** `16`
3. Click **Create Project**

### 1.3 Lấy Connection String

Sau khi tạo xong, Neon hiện ngay **Connection Details**:

1. Chọn tab **Parameters** (hoặc **Connection string**)
2. Copy **connection string**, dạng:
   ```
   postgresql://username:password@ep-xxx-xxx-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
3. 📋 **Lưu lại!** (cần dùng ở bước sau)

### 1.4 Chạy Migrations

Mở terminal trên máy bạn:

```bash
cd C:\Coding\GodsAgentPatchv0

# Paste connection string của bạn vào đây:
$env:DATABASE_URL="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Chạy migrations (tạo 16 tables)
npm run migrate:up -w apps/api

# Chạy seed data (categories, skills, achievements)
npm run seed -w apps/api
```

Nếu thấy `Migrations completed` → ✅ Database OK!

> **Lỗi "connection refused"?** Kiểm tra connection string có `?sslmode=require` ở cuối.

---

## BƯỚC 2: Deploy Backend lên Render (10 phút)

### 2.1 Đăng ký

1. Vào **[render.com](https://render.com)** → click **Get Started**
2. Chọn **GitHub** → authorize Render truy cập GitHub

### 2.2 Tạo Web Service

1. Dashboard → click **New** → **Web Service**
2. Chọn **Build and deploy from a Git repository** → **Next**
3. Tìm repo `gig-job-marketplace` → click **Connect**
4. Cấu hình:

| Field | Value |
|---|---|
| **Name** | `gig-marketplace-api` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci && cd apps/api && npm run build` |
| **Start Command** | `cd apps/api && npm run start` |
| **Plan** | **Free** |

5. Cuộn xuống phần **Environment Variables** → click **Add Environment Variable**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | *(paste connection string Neon từ bước 1.3)* |
| `JWT_SECRET` | *(tạo bằng lệnh bên dưới)* |
| `REFRESH_TOKEN_SECRET` | *(tạo bằng lệnh khác bên dưới)* |
| `CORS_ORIGIN` | `https://gig-job-marketplace.vercel.app` *(tạm, sửa sau)* |
| `FRONTEND_URL` | `https://gig-job-marketplace.vercel.app` |
| `LOG_LEVEL` | `info` |

**Tạo JWT secrets** — chạy 2 lần trên terminal:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```
→ Copy kết quả lần 1 → paste vào `JWT_SECRET`  
→ Copy kết quả lần 2 → paste vào `REFRESH_TOKEN_SECRET`

Ngoài ra cần thêm các biến DB riêng lẻ (parse từ connection string Neon):
```
DB_HOST = ep-xxx.ap-southeast-1.aws.neon.tech
DB_PORT = 5432
DB_NAME = neondb
DB_USER = username
DB_PASSWORD = password
```

6. Click **Create Web Service**
7. Đợi build + deploy (5-10 phút, lần đầu lâu hơn)

### 2.3 Verify Backend

Sau khi deploy xong → Render cho URL dạng:  
`https://gig-marketplace-api.onrender.com`

1. Mở trình duyệt → paste URL + `/api/v1/health`:
   ```
   https://gig-marketplace-api.onrender.com/api/v1/health
   ```
2. Nếu thấy `{"success": true, "data": {"status": "healthy"}}` → ✅ **Backend LIVE!**

> **Lần đầu chậm ~30 giây** là bình thường (cold start). Lần sau nhanh hơn nhiều.

📋 **Copy URL Render** — cần cho bước 3.

---

## BƯỚC 3: Deploy Frontend lên Vercel (5 phút)

### 3.1 Đăng ký

1. Vào **[vercel.com](https://vercel.com)** → click **Sign Up**
2. Chọn **Continue with GitHub**

### 3.2 Import Project

1. Dashboard → click **Add New...** → **Project**
2. Tìm repo `gig-job-marketplace` → click **Import**
3. Cấu hình:

| Field | Value |
|---|---|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | Click **Edit** → nhập `apps/web` |

4. Mở phần **Environment Variables** → thêm:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://gig-marketplace-api.onrender.com` *(URL Render từ bước 2.3)* |

5. Click **Deploy** → đợi 2-5 phút

### 3.3 Verify Frontend

Deploy xong → Vercel cho URL dạng:  
`https://gig-job-marketplace.vercel.app`

Mở trình duyệt → paste URL → thấy trang web → ✅ **Frontend LIVE!**

📋 **Copy URL Vercel** — cần cho bước 4.

---

## BƯỚC 4: Cập nhật CORS (2 phút)

Frontend đã có URL thật, cần cập nhật CORS ở backend:

1. Vào **Render Dashboard** → service `gig-marketplace-api`
2. Click **Environment** tab
3. Sửa 2 biến:

| Key | Value mới |
|---|---|
| `CORS_ORIGIN` | `https://gig-job-marketplace.vercel.app` *(URL Vercel thật)* |
| `FRONTEND_URL` | `https://gig-job-marketplace.vercel.app` |

4. Click **Save Changes** → Render tự redeploy

---

## BƯỚC 5: Anti-Sleep bằng Google Apps Script (3 phút) 🔥

> Trick miễn phí để giữ Render backend **luôn thức**, không bị cold start 30 giây!

### Cách hoạt động

```
Google Apps Script (free, chạy mỗi 5 phút)
        │
        ▼  ping GET request
┌───────────────────────────┐
│  Render Backend           │
│  /api/v1/health           │  ← Nhận request → không ngủ!
└───────────────────────────┘
```

Render free tier ngủ sau **15 phút** không có request.  
Google Apps Script ping mỗi **5 phút** → backend **không bao giờ ngủ** → không cold start!

### 5.1 Tạo Google Apps Script

1. Vào **[script.google.com](https://script.google.com)** (đăng nhập bằng Gmail)
2. Click **New Project** (nút `+` ở góc trái)
3. Đặt tên project: `Render Keep Alive` (click vào "Untitled project" phía trên)
4. **Xóa hết** code mặc định, paste đoạn sau:

```javascript
// ============================================
// Render Keep-Alive Script
// Ping backend mỗi 5 phút để tránh cold start
// ============================================

const RENDER_HEALTH_URL = "https://gig-marketplace-api.onrender.com/api/v1/health";
// ↑ Thay bằng URL Render thật của bạn

function keepAlive() {
  try {
    const response = UrlFetchApp.fetch(RENDER_HEALTH_URL, {
      method: "GET",
      muteHttpExceptions: true,
      followRedirects: true,
    });

    const code = response.getResponseCode();
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    if (code === 200) {
      console.log(`✅ [${now}] Backend healthy (HTTP ${code})`);
    } else {
      console.log(`⚠️ [${now}] Backend responded with HTTP ${code}`);
    }
  } catch (error) {
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    console.log(`❌ [${now}] Ping failed: ${error.message}`);
  }
}

// Chạy thử thủ công — click nút ▶ Run ở toolbar
function testKeepAlive() {
  keepAlive();
}
```

5. Click nút **💾 Save** (Ctrl+S)

### 5.2 Test thử

1. Chọn function `testKeepAlive` ở dropdown trên toolbar
2. Click nút **▶ Run**
3. Lần đầu sẽ hỏi **quyền truy cập** → click **Review Permissions** → chọn tài khoản Google → **Allow**
4. Xem kết quả ở tab **Execution log** phía dưới:
   - `✅ Backend healthy (HTTP 200)` → OK!

### 5.3 Đặt lịch chạy tự động (mỗi 5 phút)

1. Sidebar trái → click biểu tượng **⏰ Triggers** (đồng hồ)
2. Click **+ Add Trigger** (góc dưới phải)
3. Cấu hình:

| Field | Value |
|---|---|
| **Choose which function** | `keepAlive` |
| **Event source** | `Time-driven` |
| **Type of time-based trigger** | `Minutes timer` |
| **Select minute interval** | `Every 5 minutes` |

4. Click **Save**

### ✅ XONG!

Từ giờ Google chạy `keepAlive()` mỗi 5 phút, 24/7, miễn phí.  
Backend Render sẽ **không bao giờ ngủ** → người dùng mở web = load ngay, **không đợi 30 giây** nữa!

### Kiểm tra hoạt động

- Vào **[script.google.com](https://script.google.com)** → project → sidebar **Executions**
- Sẽ thấy danh sách các lần chạy với status `Completed` mỗi 5 phút

### Giới hạn Google Apps Script (free)

| Hạn mức | Giá trị |
|---|---|
| Trigger executions / ngày | **20,000** (bạn chỉ dùng 288/ngày = 1.4%) |
| URL Fetch calls / ngày | **20,000** (dư sức) |
| Total runtime / ngày | **90 phút** (mỗi ping mất ~1 giây) |

→ Hoàn toàn đủ, không lo vượt giới hạn.

---

## XONG! 🎉

Bây giờ bạn có:

| Service | URL | Trạng thái |
|---|---|---|
| **Frontend** | `https://gig-job-marketplace.vercel.app` | Luôn online |
| **Backend API** | `https://gig-marketplace-api.onrender.com` | Luôn online (nhờ Apps Script) |
| **Health check** | `https://gig-marketplace-api.onrender.com/api/v1/health` | Ping mỗi 5 phút |

Gửi link Frontend cho bất kỳ ai → họ mở trình duyệt → dùng được ngay, **không chờ đợi**!

---

## Troubleshooting Hay Gặp

### Frontend bấm nút không phản hồi / "Network Error"
**Nguyên nhân:** Backend đang ngủ (cold start trên Render free tier).  
**Fix:** Đợi 30 giây → thử lại. Hoặc vào `https://YOUR-RENDER-URL/api/v1/health` trước để "đánh thức".

### CORS Error trên Console
**Nguyên nhân:** `CORS_ORIGIN` trên Render chưa khớp URL Vercel.  
**Fix:** Render → Environment → sửa `CORS_ORIGIN` = đúng URL Vercel (có `https://`, KHÔNG có `/` cuối).

### "Relation does not exist" / "Table not found"
**Nguyên nhân:** Chưa chạy migrations ở bước 1.4.  
**Fix:** Chạy lại `npm run migrate:up -w apps/api` với `DATABASE_URL` Neon.

### Build failed trên Render
**Nguyên nhân thường gặp:** Lỗi TypeScript hoặc thiếu dependency.  
**Fix:** Kiểm tra build local: `npm ci && cd apps/api && npm run build` — fix lỗi → push lại.

### Neon database "suspended"
**Bình thường!** Neon free auto-suspend sau 5 phút. Request đầu tiên sẽ tự "wake up" (mất 2-3 giây).

---

## Khi nào nên chuyển sang trả phí?

| Dấu hiệu | Giải pháp |
|---|---|
| Cold start 30s không chấp nhận được | Render Starter ($7/mo) — luôn online |
| DB quá 0.5GB | Neon Launch ($19/mo) hoặc Supabase free (500MB) |
| Cần custom domain | Free trên Vercel, $7 trên Render |
| Nhiều người dùng đồng thời | Upgrade Render + Neon plan |
