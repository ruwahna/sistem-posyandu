# Rencana Kerja & Daftar Tugas (Todos.md) — Sistem Informasi Posyandu

Dokumen ini melacak kemajuan pengerjaan proyek Sistem Informasi Posyandu (SaaS Multi-tenant). Kemajuan dibagi menjadi beberapa fase berdasarkan target MVP v1.

---

## 📊 Ringkasan Progress
- [x] **Fase 1: Frontend Client Prototype** (100% Selesai)
- [ ] **Fase 2: Backend API & Database Setup** (0% Selesai)
- [ ] **Fase 3: Integrasi Client-Server & Autentikasi** (0% Selesai)
- [ ] **Fase 4: Testing & Deployment** (0% Selesai)

---

## 🛠️ Daftar Detail Tugas

### Fase 1: Frontend Client Prototype (Selesai)
Fase ini berfokus pada pembangunan antarmuka pengguna (UI/UX) premium, bersih, dan taktil yang mudah digunakan oleh kader di lapangan, menggunakan Next.js + Tailwind CSS v3 + Lucide Icons.

*   [x] **Setup Project Client:**
    *   Inisialisasi aplikasi Next.js (App Router) dengan TypeScript.
    *   Konfigurasi Tailwind CSS v3 (custom theme toska `#14B8A6`, radius `20px`, shadow `soft-card`).
    *   Instalasi dan konfigurasi Google Fonts `Plus Jakarta Sans`.
*   [x] **Modul Dashboard Overview:**
    *   Pembuatan 4 summary cards untuk metrik utama dilengkapi persentase tren bulanan.
    *   Implementasi grafik batang tumbuh kembang balita (SVG) dengan interaksi tooltip hover.
    *   Implementasi semi-donut chart (SVG) untuk monitoring persentase aktivitas kunjungan bulanan.
*   [x] **Modul Balita:**
    *   Tampilan daftar balita lengkap dengan pencarian dan filter kelompok usia (0-6, 7-12, 13-24, 25-60 bulan).
    *   Form pendaftaran balita baru.
    *   Halaman detail profil balita dan histori perkembangan bulanan.
    *   Form input pengukuran bulanan balita (BB, TB, LK, Vitamin A, status gizi BBU/TBU/BBTB).
    *   Sistem deteksi peringatan input data (misal: berat badan tidak logis) secara *real-time*.
*   [x] **Modul Lansia:**
    *   Tampilan daftar lansia lengkap dengan pencarian, filter kelompok umur, dan filter riwayat penyakit HT/DM.
    *   Form pendaftaran lansia baru (BPJS, tingkat kemandirian A/B/C, dan penyakit bawaan).
    *   Halaman detail lansia berisi informasi penyakit bawaan, skrining mental emosional, dan tabel riwayat periksa bulanan.
    *   Form input pemeriksaan fisik bulanan lansia (BB, TB, Sistol/Diastol, GDS, Lingkar Perut).
    *   Sistem deteksi peringatan *real-time* untuk tekanan darah sistol tinggi (>200 mmHg) atau GDS tinggi (>300 mg/dL).
*   [x] **Modul Riwayat Log Sentral:**
    *   Tabel riwayat seluruh assessment bulanan posyandu terintegrasi.
*   [x] **Modul Pencatatan Pelayanan (Baru - Layar Penuh):**
    *   Halaman khusus pencatatan terpisah untuk kemudahan kader saat melayani antrean ramai.
    *   Panel pencarian dan pemilihan cepat balita/lansia di sisi kiri.
    *   Formulir input pemeriksaan bulanan (pediatrik/geriatrik) di sisi kanan dengan alert/warning real-time.
    *   Tabel log rekap hasil pemeriksaan untuk sesi pelayanan hari ini di bagian bawah.
*   [x] **Modul Manajemen Akun & Pengaturan (Terpisah):**
    *   Form detail edit nama, desa, kecamatan, dan alamat posyandu (Modul Pengaturan).
    *   Manajemen daftar kader aktif - Ubah Status, Ubah Peran, dan Hapus Akses (Modul Manajemen Akun).
    *   Pembuatan akun kader baru secara langsung oleh Owner (Modul Manajemen Akun).
    *   Fitur penentu kode undangan acak (*generate invitation code*) untuk kolaborasi (Modul Manajemen Akun).
*   [x] **Validasi Build:**
    *   Tes build produksi (`npm run build`) sukses tanpa ada error lint/TypeScript.

---

### Fase 2: Backend API & Database Setup (Belum Dimulai)
Fase ini berfokus pada pembuatan server API menggunakan Node.js/Express dengan TypeScript, relasi database PostgreSQL di Supabase, dan interaksi data menggunakan Prisma ORM.

*   [ ] **Inisialisasi Project Server:**
    *   Buat folder `/server` dan setup project Node.js + TypeScript + Express.
    *   Konfigurasi script compile, nodemon, dan tsconfig.
*   [ ] **Database & ORM Setup:**
    *   Instalasi Prisma ORM di sisi server.
    *   Koneksikan Prisma dengan database Supabase PostgreSQL.
    *   Tulis file `schema.prisma` yang mendefinisikan tabel relasional:
        *   `Posyandu` (id, nama, desa, kecamatan, alamat)
        *   `Kader/User` (id, posyandu_id, nama, email, password, role)
        *   `Balita` (id, posyandu_id, nama, nik, tanggal_lahir, jenis_kelamin, nama_ibu, alamat)
        *   `PemeriksaanBalita` (id, balita_id, tanggal_periksa, usia_bulan, berat_badan, tinggi_badan, lingkar_kepala, status_bb_u, status_tb_u, status_bb_tb, vitamin_a)
        *   `Lansia` (id, posyandu_id, nama, nik, no_bpjs, rt_rw, tanggal_lahir, jenis_kelamin, alamat, riwayat_ht, riwayat_dm, tingkat_kemandirian, gangguan_mental_emosional)
        *   `PemeriksaanLansia` (id, lansia_id, tanggal_periksa, berat_badan, tinggi_badan, tekanan_darah_sistol, tekanan_darah_diastol, gula_darah_sewaktu, lingkar_perut)
    *   Lakukan database migration pertama (`npx prisma migrate dev`).
*   [ ] **Pembuatan API Routes & Controllers:**
    *   **Auth API:** Sign up kader baru, login (mengeluarkan JWT), logout, dan verifikasi session token.
    *   **Posyandu API:** Registrasi posyandu baru saat pertama kali kader onboard.
    *   **Balita API:** Endpoint CRUD Balita dan penambahan riwayat periksa.
    *   **Lansia API:** Endpoint CRUD Lansia dan penambahan riwayat periksa.
    *   **Undangan API:** Validasi kode undangan untuk memasukkan kader baru ke posyandu yang sama.
*   [ ] **Shared Package Setup (`/shared`):**
    *   Buat folder `/shared` di root untuk menaruh tipe data TypeScript bersama.
    *   Tulis skema validasi Zod untuk request payload (misal: validasi form registrasi, input pemeriksaan) agar bisa di-import oleh `/client` dan `/server`.

---

### Fase 3: Integrasi Client-Server & Autentikasi (Belum Dimulai)
Fase ini menghubungkan frontend dengan backend API serta menegakkan isolasi data antar posyandu (multi-tenant).

*   [ ] **API Client Setup:**
    *   Setup instansi Axios di client dengan interceptor untuk otomatis menyertakan JWT token di header Authorization.
*   [ ] **Integrasi Auth & RLS:**
    *   Implementasikan form registrasi & login asli menggunakan Supabase Auth / JWT.
    *   Terapkan middleware auth guard di backend server.
    *   **Isolasi Tenant:** Pastikan query database di sisi server selalu memfilter data berdasarkan `posyandu_id` dari JWT token kader yang sedang login (kader Posyandu A sama sekali tidak bisa membaca data Posyandu B).
*   [ ] **Integrasi State & Form:**
    *   Ganti mock state di `BalitaModule`, `LansiaModule`, dan `DashboardModule` dengan fetch data asli menggunakan React Query atau hooks.
    *   Integrasikan tombol submit form pendaftaran dan pemeriksaan dengan API server.
*   [ ] **Real-time Dashboard Metrics:**
    *   Hubungkan bagan pertumbuhan (SVG) dan chart donut dengan kalkulasi data real-time agregat dari database.

---

### Fase 4: Testing & Deployment (Belum Dimulai)
Fase akhir sebelum aplikasi siap digunakan secara langsung.

*   [ ] **Pengujian Skenario Aplikasi:**
    *   Uji skenario pendaftaran mandiri oleh Kader Pemilik Posyandu baru.
    *   Uji skenario undang kader anggota dan kolaborasi input data bersamaan.
    *   Uji keamanan data (mencegah akses lintas posyandu melalui manipulasi URL/ID).
*   [ ] **Deployment:**
    *   Deploy database dan skema Prisma ke Supabase.
    *   Deploy backend API (folder `/server`) ke platform serverless/hosting (Railway, Render, atau Heroku).
    *   Deploy frontend client (folder `/client`) ke Vercel atau Netlify.
    *   Uji performa dan kecepatan muat (NFR-02: daftar muat kurang dari 2 detik).

---

## 📈 Rencana Pengembangan Selanjutnya (Fase 2 / Pasca-MVP)
- [ ] Implementasi **Modul Ibu Hamil** (Identitas, HPHT, taksiran kelahiran, lingkar lengan LILA, dan tensi bulanan).
- [ ] Integrasi **Grafik Pertumbuhan WHO** interaktif (grafik garis melengkung hijau/kuning/merah untuk BB/U dan TB/U).
- [ ] Export laporan format **Excel (.xlsx)** dan **PDF** asli yang siap diserahkan ke Puskesmas kecamatan.
- [ ] Fitur **Notifikasi WhatsApp** pengingat jadwal posyandu bulanan untuk ibu balita dan lansia.
- [ ] Deteksi dini **Stunting** otomatis berbasis AI berdasarkan parameter WHO.
