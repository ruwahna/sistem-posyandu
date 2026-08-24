# Dokumen Kebutuhan Production (Production Requirements)
**Sistem Informasi Posyandu**

---

## 1. Ringkasan Arsitektur & Tech Stack

Sistem Informasi Posyandu dibangun menggunakan arsitektur monorepo terpisah antara Client dan Server:

* **Frontend (Client):** Next.js (React 19, TypeScript, Tailwind CSS)
* **Backend (Server):** Node.js + Express.js (TypeScript)
* **Database:** PostgreSQL dengan Prisma ORM
* **Autentikasi:** JSON Web Token (JWT) & Google OAuth
* **Layanan Eksternal:** Notifikasi WhatsApp (WA Gateway), Email SMTP (Nodemailer/Resend), Export PDF (PDFKit), Export Excel (ExcelJS)

---

## 2. Kebutuhan Infrastruktur & Hosting

### Option A: Serverless / Cloud Managed (Direkomendasikan)
* **Frontend:** Vercel / Netlify (Deploy otomatis via Git)
* **Backend API:** Vercel (Serverless Functions) atau Railway / Render / Fly.io
* **Database:** PostgreSQL Managed Service (Supabase / Neon / Render Postgres / AWS RDS)
  * Spesifikasi Minimum Database: 1 vCPU, 1 GB RAM, Storage 10 GB SSD (dengan Auto-Scaling)
  * Fitur Wajib DB: SSL Connection Enable (`sslmode=require`), Connection Pooling (Prisma Accelerate atau PgBouncer)

### Option B: Virtual Private Server (VPS / Dedicated Server)
* **OS:** Ubuntu 22.04 / 24.04 LTS
* **Spesifikasi Server Minimum:**
  * CPU: 2 vCPU
  * RAM: 4 GB
  * Storage: 40 GB SSD / NVMe
  * Bandwidth: 1 TB/bulan
* **Software Stack:**
  * **Node.js:** v20.x LTS / v22.x LTS
  * **Reverse Proxy & Web Server:** Nginx (dengan Let's Encrypt Certbot untuk HTTPS)
  * **Process Manager:** PM2 (untuk pengelolaan proses Node.js backend) atau Docker Containerization (Docker Compose)
  * **Database:** PostgreSQL 15+

---

## 3. Daftar Variabel Lingkungan (Environment Variables)

### 3.1. Backend API (`server/.env`)

| Nama Variable | Deskripsi | Contoh / Format |
|---|---|---|
| `NODE_ENV` | Mode lingkungan | `production` |
| `PORT` | Port server backend | `5000` |
| `DATABASE_URL` | Connection string PostgreSQL (Pooled) | `postgresql://user:password@host:5432/dbname?pgbooster=true` |
| `DIRECT_URL` | Connection string PostgreSQL langsung (Migrasi) | `postgresql://user:password@host:5432/dbname` |
| `JWT_SECRET` | Secret key penandatanganan Token JWT (Min 64 karakter acak) | `random_long_string_hash...` |
| `JWT_EXPIRES_IN` | Masa berlaku token JWT | `1d` atau `7d` |
| `CLIENT_ORIGIN` | URL Frontend terotorisasi (CORS) | `https://posyandu.domain.com` |
| `SMTP_HOST` | Host Server Email | `smtp.gmail.com` / `smtp.resend.com` |
| `SMTP_PORT` | Port Server Email | `465` (SSL) atau `587` (TLS) |
| `SMTP_USER` | Email pengirim | `noreply@posyandu.com` |
| `SMTP_PASS` | Password / App Password Email | `secret_app_password` |
| `SMTP_FROM` | Label Pengirim Email | `"Posyandu Admin" <noreply@posyandu.com>` |
| `WA_GATEWAY_URL` | API URL Provider Notifikasi WhatsApp | `https://api.fonnte.com/send` |
| `WA_GATEWAY_TOKEN` | API Token Provider WhatsApp | `wa_token_secret_123` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID dari Google Cloud Console | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret dari Google Cloud Console | `GOCSPX-xxxx...` |

### 3.2. Frontend (`client/.env.production`)

| Nama Variable | Deskripsi | Contoh / Format |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL API Backend | `https://api.posyandu.domain.com/api` |
| `NEXT_PUBLIC_APP_NAME` | Nama Aplikasi | `Sistem Informasi Posyandu` |

---

## 4. Kebutuhan Keamanan (Security Requirements)

1. **Sertifikat SSL/TLS (HTTPS):**
   * Seluruh domain frontend (`posyandu.domain.com`) dan backend (`api.posyandu.domain.com`) wajib menggunakan HTTPS (TLS 1.2+).
2. **Pengaturan CORS (Cross-Origin Resource Sharing):**
   * Restriksi CORS hanya mengizinkan `CLIENT_ORIGIN` resmi. Jangan gunakan wildcard (`*`) pada lingkungan produksi.
3. **Keamanan HTTP Headers:**
   * Penggunaan `helmet` pada Express untuk proteksi XSS, Clickjacking, MIME sniffing, HSTS, dll.
4. **Rate Limiting:**
   * Penerapan `express-rate-limit` pada endpoint sensitif (misal: `/api/auth/login`, `/api/auth/forgot-password`) untuk mencegah brute-force attack (misal: max 10 request / minute).
5. **Manajemen Password & Token:**
   * Password di-hash menggunakan `bcryptjs` dengan salt round min. 10.
   * `JWT_SECRET` disimpan aman pada environment secrets server dan tidak pernah di-commit ke Git Repository.
6. **Validasi Input:**
   * Seluruh request body, query, dan params dipastikan divalidasi ketat menggunakan `Zod`.

---

## 5. Kebutuhan Performa & Skalabilitas

1. **Prisma Client Connection Pooling:**
   * Mengkonfigurasi limit koneksi database agar tidak terjadi *exhaustion* pada PostgreSQL (`connection_limit=10-20`).
2. **Build Optimization:**
   * Menjalankan `npm run build` sebelum penyesuaian produksi.
   * Menghapus devDependencies yang tidak terpakai pada server produksi (`npm prune --production`).
3. **Gzip / Brotli Compression:**
   * Pengaktifan kompresi pada Nginx / Vercel untuk mempercepat transfer file statis JS/CSS dan JSON payload.

---

## 6. Kebutuhan Backup & Recovery (Disaster Recovery)

1. **Database Backup:**
   * **Jadwal Backup:** Otomatis harian (Daily Automated Backup pada jam 02.00 WIB).
   * **Metode Backup:** `pg_dump` terenkripsi yang diunggah ke cloud storage terpisah (misal: AWS S3 / Cloudflare R2 / Google Cloud Storage).
   * **Retention Policy:** Menyimpan backup harian selama 30 hari, backup bulanan selama 12 bulan.
2. **Recovery Testing:**
   * Pengujian prosedur restorasi database dari backup minimal 1 kali setiap 3 bulan.

---

## 7. Kebutuhan Monitoring & Logging

1. **Logging Aplikasi:**
   * Log aktivitas penting (Audit Logs) dicatat di database (`audit_log` table).
   * HTTP Logging menggunakan `morgan` atau `winston` disalurkan ke stdout / file log terrotasi (`pm2-logrotate`).
2. **Health Check Endpoint:**
   * Menyediakan endpoint `/api/health` untuk memantau status server backend dan koneksi database Prisma.
3. **Uptime Monitoring:**
   * Mengintegrasikan UptimeRobot / Better Stack untuk memantau availability server (alerting via Email/Telegram jika server down).

---

## 8. Estimasi Biaya Operasional Production (Production Cost Estimation)

Berikut adalah rincian estimasi biaya operasional bulanan dan tahunan untuk menjalankan Sistem Informasi Posyandu di lingkungan produksi.

### 8.1. Rincian Komponen Biaya

| Komponen | Penyedia / Opsi | Estimasi Biaya (IDR) | Keterangan |
|---|---|---|---|
| **Domain** | `.com` / `.id` / `.my.id` | **Rp 15.000 – Rp 250.000 / tahun** | • `.my.id`: ~Rp 15.000/thn<br>• `.com`: ~Rp 160.000/thn<br>• `.id`: ~Rp 225.000/thn |
| **Frontend Hosting** | Vercel / Netlify | **Rp 0 / bulan** *(Free Tier)* | Kuota gratis Vercel/Netlify mencukupi untuk frontend Next.js skala Posyandu. |
| **Backend API Server** | **Opsi 1:** Cloud PaaS (Railway / Render)<br>**Opsi 2:** VPS (Biznet Gio / Niagahoster / DigitalOcean 2vCPU 4GB RAM) | **Rp 80.000 – Rp 250.000 / bulan** | • Railway/Render: ~$5–$10/bln<br>• VPS Lokal/International: ~Rp 150rb–Rp 250rb/bln |
| **Database PostgreSQL** | **Opsi 1:** Managed DB (Supabase / Neon DB)<br>**Opsi 2:** Self-hosted DB di VPS | **Rp 0 – Rp 160.000 / bulan** | • Supabase/Neon: Free Tier (500MB) s.d Pro ($10–$15/bln)<br>• Self-hosted di VPS: Rp 0 (include harga VPS) |
| **Notifikasi WhatsApp** | **Opsi A (WA Gateway 3rd Party):** Fonnte / Wablas / Ruanggwa<br>**Opsi B (WA Business API Meta):** via BSP (Qiscus / Watapme) | **Rp 50.000 – Rp 200.000 / bulan** | • 3rd party (Fonnte/Wablas): ~Rp 50.000 - Rp 100.000/bln (Unlimited/quota pesan)<br>• Official Meta API: ~Rp 350-450 per pesan utility |
| **Email Transactional** | Resend / Brevo / Gmail SMTP | **Rp 0 / bulan** *(Free Tier)* | Resend / Brevo menyediakan 300 email/hari gratis (sangat mencukupi untuk reset password / notifikasi). |
| **Backup Storage** | Cloudflare R2 / AWS S3 | **Rp 0 – Rp 20.000 / bulan** | Cloudflare R2 gratis hingga 10 GB storage backup DB. |
| **SSL & Security** | Let's Encrypt / Cloudflare | **Rp 0** *(Gratis)* | Sertifikat SSL otomatis gratis dan terbarui secara otomatis. |
| **Uptime Monitoring** | UptimeRobot / Better Stack | **Rp 0** *(Free Tier)* | Pemantauan 5 menit sekali gratis hingga 50 monitor. |

---

### 8.2. Simulasi Paket Biaya Operasional

#### 💡 Paket A: Hemat / Minimal (Cocok untuk Uji Coba / Posyandu Skala Kecil)
* **Domain:** `.my.id` (Rp 15.000 / tahun)
* **Hosting Frontend:** Vercel (Gratis)
* **Backend & DB:** Supabase Free Tier + Railway Hobby ($5 / bln ≈ Rp 80.000)
* **WhatsApp Gateway:** Fonnte Paket Starter (Rp 50.000 / bulan)
* **Email & SSL:** Resend + Cloudflare (Gratis)
* **Total Biaya Bulanan:** **± Rp 130.000 / bulan**
* **Total Biaya Tahunan:** **± Rp 1.575.000 / tahun**

#### 🚀 Paket B: Standar / Rekomendasi Production (Sangat Stabil & Terisolasi)
* **Domain:** `.com` atau `.id` (Rp 180.000 / tahun)
* **Server VPS:** VPS Cloud 2 vCPU, 4GB RAM (Rp 180.000 / bulan) — menampung Backend Express + DB PostgreSQL + Nginx + PM2
* **WhatsApp Gateway:** Fonnte / Wablas Regular (Rp 90.000 / bulan)
* **Email & Backup Storage:** Brevo + Cloudflare R2 (Gratis / Rp 0)
* **Total Biaya Bulanan:** **± Rp 270.000 / bulan**
* **Total Biaya Tahunan:** **± Rp 3.420.000 / tahun**

#### 🏢 Paket C: Enterprise / Official Meta API (Notifikasi Resmi WA Centang Hijau)
* **Domain:** `.id` (Rp 225.000 / tahun)
* **Server & DB:** VPS 4 vCPU 8GB RAM + Managed Supabase DB (± Rp 450.000 / bulan)
* **WhatsApp API:** Official Meta BSP (Biaya berlangganan platform + bayar per pesan utility ± Rp 500.000 / bulan)
* **Total Biaya Bulanan:** **± Rp 950.000 / bulan**
* **Total Biaya Tahunan:** **± Rp 11.625.000 / tahun**

---

## 9. Checklist Prosedur Deployment (Deployment Checklist)

### Sebelum Deployment (Pre-Launch)
- [ ] Semua variabel lingkungan (`.env`) produksi sudah disiapkannya di Server / Platform Deployment.
- [ ] Database PostgreSQL produksi sudah diinisialisasi dan diuji koneksinya.
- [ ] Perintah migrasi database Prisma telah dijalankan (`npx prisma migrate deploy`).
- [ ] Seeding data awal/admin (jika diperlukan) telah berhasil (`npx prisma db seed`).
- [ ] Domain dan sub-domain sudah di-pointing ke server dengan DNS A/CNAME record yang benar.
- [ ] SSL Certificate (HTTPS) aktif tanpa error.

### Saat Deployment (Launch)
- [ ] Build Frontend (`npm run build:client`) sukses tanpa error TypeScript / ESLint.
- [ ] Build Backend (`npm run build:server`) sukses menghasilkan file compiled JavaScript di `/dist`.
- [ ] Menjalankan proses backend via PM2 / Docker Container.
- [ ] Uji coba login pengguna (Owner & Kader) pada environment produksi.
- [ ] Uji coba fitur proteksi rute & enkripsi JWT.

### Pasca Deployment (Post-Launch)
- [ ] Memastikan fitur notifikasi WhatsApp berfungsi terkirim ke nomor penerima.
- [ ] Memastikan fitur ekspor PDF dan Excel berfungsi di lingkungan produksi.
- [ ] Memastikan fitur pengiriman email (Reset Password / Notifikasi) berhasil terkirim.
- [ ] Menyalakan otomatisasi backup database harian.
- [ ] Mendaftarkan endpoint health check ke Uptime Monitoring.
