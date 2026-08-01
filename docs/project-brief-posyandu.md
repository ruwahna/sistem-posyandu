# Project Brief — Sistem Informasi Posyandu (MVP v1)

> Versi ini merevisi brief  berdasarkan pengamatan langsung terhadap
> register fisik Posyandu Balita "Sri Lestari" (Desa Karanggayam) dan
> register Kunjungan Lansia Puskesmas Karanggayam I, ditambah keputusan
> baru: **platform multi-tenant self-service** — kader bisa mendaftar
> sendiri sebagai Posyandu di daerahnya. Perubahan utama ditandai dengan
> label **[BARU]**.

---

## 1. Ringkasan Proyek

Sistem Informasi Posyandu adalah aplikasi berbasis web (SaaS multi-tenant)
untuk membantu kader Posyandu mendigitalkan pencatatan pelayanan kesehatan.
Siapa pun kader dapat **mendaftar akun dan membuat Posyandu-nya sendiri**
(sesuai desa/wilayahnya) tanpa perlu didaftarkan manual oleh Admin
platform. Pada tahap **MVP v1**, sistem difokuskan pada dua modul yang
paling sering dipakai kader di lapangan: **Balita** dan **Lansia**.
**Modul Ibu Hamil ditunda (menyusul)** dan akan dikembangkan pada fase
berikutnya setelah dua modul ini stabil.

Konsep utama tetap **multi-posyandu**, tapi sekarang ditegakkan lewat
**akun & kepemilikan (ownership)**: setiap Posyandu terhubung ke akun
kader yang mendaftarkannya, dan data (Balita, Lansia, riwayat
pemeriksaan) hanya bisa diakses oleh kader yang tergabung di Posyandu
tersebut — **tidak bercampur** dengan Posyandu lain, baik secara tampilan
maupun secara query di database.

---

## 2. Insight dari Data Lapangan **[BARU]**

Setelah mempelajari register fisik yang benar-benar dipakai kader, ada 3
temuan yang mengubah desain MVP:

### 2.1 Pemeriksaan itu **berulang tiap bulan**, bukan sekali input
Register Lansia mencatat hasil pemeriksaan per bulan dalam kolom-kolom
terpisah (Desember, Jan-26, Feb-26, Mar-26, dst — masing-masing berisi
TD & GDS). Artinya satu orang lansia/balita punya **banyak baris riwayat
pemeriksaan dari waktu ke waktu**, bukan satu set data yang di-*overwrite*
tiap kunjungan.

➡️ Konsekuensi desain: field "Pemeriksaan Awal" pada brief lama tidak cukup.
Sistem butuh tabel **riwayat pemeriksaan** terpisah (1 balita/lansia → banyak
pemeriksaan), meskipun UI tetap sederhana (cukup 1 tombol "Tambah Hasil
Pemeriksaan Bulan Ini").

### 2.2 Data Balita punya indikator status gizi standar
Register Balita mencatat, selain BB & TB:
- **Kategori usia** dalam bulan (0–6, 7–12, 13–24, 25–60)
- **Status gizi** berdasar 3 indikator: **BB/U**, **TB/U**, **BB/TB**,
  masing-masing dengan kode kategori (mis. N = Normal, K = Kurang,
  SK = Sangat Kurang, L = Lebih, P = Pendek, SP = Sangat Pendek,
  T = Tinggi, G = Gemuk)
- **Vitamin A** (ada/tidak diberikan)
- Nama Ibu tetap wajib dicatat

### 2.3 Data Lansia jauh lebih kaya dari asumsi awal
Register Lansia mencatat:
- **NIK & Nomor BPJS**
- **RT/RW** dan alamat
- **Riwayat penyakit** — minimal flag **HT** (Hipertensi) dan **DM**
  (Diabetes Melitus)
- **Kelompok umur** (45–59, 60–69, ≥70 tahun)
- **Tingkat kemandirian** lansia (kategori A/B/C)
- **Gangguan mental emosional** (hasil skrining, boleh teks bebas/skala)
- Pemeriksaan bulanan: **BB/TB, TD (Tekanan Darah), GDS (Gula Darah
  Sewaktu), LP (Lingkar Perut)**

Field-field ini sebelumnya tidak ada di brief lama, tapi jelas dipakai
kader setiap bulan di lapangan — jadi dipindah ke dalam scope MVP.

### 2.4 Posyandu didaftarkan mandiri oleh kader **[BARU]**
Sebelumnya Posyandu diasumsikan dibuat oleh Admin platform secara manual.
Keputusan baru: sistem ini akan dipakai oleh **banyak kader dari berbagai
desa/wilayah secara mandiri**, sehingga proses onboarding harus **self-
service**: kader mendaftar akun sendiri → membuat Posyandu miliknya →
langsung bisa input data. Ini mengubah beberapa hal mendasar:

- **Autentikasi (login/registrasi) naik menjadi bagian dari MVP**, bukan
  lagi "fase berikutnya" seperti di brief .
- Setiap Posyandu punya **pemilik (owner)** — kader yang pertama kali
  mendaftarkannya.
- **Isolasi data** harus ditegakkan di level aplikasi & database (bukan
  cuma UI): kader dari Posyandu A tidak boleh bisa melihat/mengubah data
  Posyandu B, meskipun mengakses URL yang sama persis.
- Perlu mekanisme agar satu Posyandu bisa punya **lebih dari satu kader**
  (mis. owner mengundang kader lain untuk membantu input data).

---

## 3. Tujuan

- Mempermudah pencatatan data peserta Posyandu (Balita & Lansia dulu).
- Mengurangi pencatatan manual menggunakan buku/register kertas.
- Memisahkan data berdasarkan Posyandu (multi-tenant sederhana).
- Menyediakan dashboard ringkas per Posyandu.
- Mencatat **riwayat pemeriksaan bulanan**, bukan cuma data terbaru, agar
  siap dipakai untuk grafik pertumbuhan/tren di versi berikutnya.
- Menjadi pondasi untuk fitur AI deteksi stunting, laporan, dan grafik
  pertumbuhan WHO pada versi berikutnya.

---

## 4. Target Pengguna **[REVISI]**

### Super Admin (platform)
- Peran teknis/operasional untuk memantau kesehatan platform secara
  keseluruhan (bukan bagian dari alur kerja harian Posyandu).
- Dapat melihat daftar seluruh Posyandu yang terdaftar (untuk keperluan
  monitoring/support), **tanpa perlu mengelola data harian Balita/Lansia**
  milik Posyandu tertentu.
- Dapat menonaktifkan Posyandu bermasalah (mis. spam/duplikat) bila perlu.

### Kader Pemilik Posyandu (Owner) **[BARU]**
- Mendaftar akun sendiri (registrasi mandiri).
- Membuat Posyandu miliknya (nama, desa, kecamatan, alamat) — otomatis
  menjadi pemilik/admin Posyandu tersebut.
- Melihat dashboard Posyandu miliknya.
- CRUD data Balita & Lansia miliknya, termasuk riwayat pemeriksaan.
- **[BARU]** Mengundang kader lain untuk bergabung ke Posyandu yang sama.

### Kader Anggota **[BARU]**
- Bergabung ke sebuah Posyandu melalui undangan pemilik.
- Memiliki akses yang sama seperti Kader Pemilik untuk operasional
  harian (CRUD Balita/Lansia, input pemeriksaan), kecuali pengaturan
  Posyandu itu sendiri (mis. menghapus Posyandu atau mengelola anggota).

---

## 5. Konsep Multi Posyandu **[REVISI]**

```
User (akun kader)
│
├── mendaftar / bergabung ──> Posyandu
                                │
                                ├── Balita ── Riwayat Pemeriksaan Balita
                                │
                                └── Lansia ── Riwayat Pemeriksaan Lansia

                                (Ibu Hamil menyusul — fase berikutnya)
```

- Satu **User** bisa tergabung di satu Posyandu (di MVP; multi-posyandu
  per user bisa dipertimbangkan di fase berikutnya).
- Satu **Posyandu** bisa punya banyak User (owner + anggota).
- Setiap data Balita/Lansia hanya dimiliki oleh satu Posyandu, dan hanya
  bisa diakses oleh User yang tergabung di Posyandu tersebut.
- Setiap Balita/Lansia bisa punya banyak baris riwayat pemeriksaan.

---

## 6. Scope MVP v1

### Autentikasi & Registrasi Posyandu **[BARU — masuk scope MVP]**
- Registrasi akun kader (email + password, via Supabase Auth)
- Login / Logout
- Alur "Daftarkan Posyandu Baru" setelah registrasi (jadi owner)
- Mengundang kader lain ke Posyandu yang sama (via link/kode undangan
  sederhana)
- Isolasi data otomatis berdasarkan Posyandu milik user yang login

### Manajemen Posyandu
- Owner dapat melihat & mengedit data Posyandu miliknya (nama, desa,
  kecamatan, alamat)
- Super Admin dapat melihat daftar seluruh Posyandu (read-only untuk
  monitoring) dan menonaktifkan Posyandu bila perlu

### Dashboard Posyandu
- Total Balita, Total Lansia
- Ringkasan status gizi Balita (mis. jumlah Gizi Kurang/Stunting bulan ini)
- Ringkasan Lansia dengan HT/DM
- Daftar pemeriksaan terbaru

### Modul Balita
- Tambah / Edit / Hapus / Detail / Daftar Balita (data identitas)
- **[BARU]** Tambah Hasil Pemeriksaan bulanan (BB, TB, status gizi, Vit A)
- **[BARU]** Riwayat pemeriksaan per Balita (tabel/list, bukan grafik dulu)

### Modul Lansia
- Tambah / Edit / Hapus / Detail / Daftar Lansia (data identitas + riwayat
  penyakit + kemandirian + gangguan mental emosional)
- **[BARU]** Tambah Hasil Pemeriksaan bulanan (BB, TB, TD, GDS, LP)
- **[BARU]** Riwayat pemeriksaan per Lansia (tabel/list)

---

## 7. Di Luar Scope MVP v1

- **Modul Ibu Hamil** (menyusul — fase berikutnya, prioritas setelah v1 stabil)
- Role granular per fitur (mis. izin berbeda-beda antar Kader Anggota) —
  di MVP semua Kader Anggota punya hak yang sama
- Login via Google/social login, reset password via WhatsApp, dsb —
  cukup email/password dulu
- Multi-posyandu per satu akun user (satu user aktif di banyak Posyandu
  sekaligus)
- Grafik Pertumbuhan WHO (visual chart)
- Jadwal Posyandu
- Imunisasi, Vitamin (di luar Vit A dasar)
- Sistem Pakar / AI Deteksi Stunting / AI Chatbot
- Export PDF / Excel
- Notifikasi WhatsApp
- Realtime Dashboard
- Integrasi Puskesmas / BPJS (nomor BPJS hanya disimpan sebagai data, belum
  terintegrasi API)

---

## 8. Struktur Halaman

```
/
│
├── Daftar Posyandu
│
└── Posyandu
    └── {id}
        │
        ├── Dashboard
        │
        ├── Balita
        │   ├── List
        │   ├── Tambah
        │   ├── Edit
        │   └── Detail
        │       └── Riwayat Pemeriksaan
        │           ├── List
        │           └── Tambah
        │
        └── Lansia
            ├── List
            ├── Tambah
            ├── Edit
            └── Detail
                └── Riwayat Pemeriksaan
                    ├── List
                    └── Tambah
```

---

## 9. Data yang Dikelola

### Posyandu
- Nama Posyandu, Desa/Kelurahan, Kecamatan, Alamat

### Balita — Identitas (Data Master — Diinput Sekali)
- No. Urut, Nama Lengkap, NIK Balita, Nama Ibu / Orang Tua, Tanggal Lahir (Kategori usia otomatis: 0–6 bln, 7–12 bln, 13–24 bln, 25–60 bln), Jenis Kelamin (L/P), Alamat / Domisili

### Balita — Riwayat Pemeriksaan Bulanan (Dinamis per Kunjungan) **[BARU: tabel terpisah]**
- Tanggal Kunjungan / Bulan Pemeriksaan
- Usia saat periksa (dihitung otomatis dalam bulan)
- **Hasil Antropometri (Pertumbuhan):**
  - Berat Badan (BB) dalam kg
  - Tinggi/Panjang Badan (TB) dalam cm
  - Lingkar Kepala (LKA) dalam cm (opsional)
  - Lingkar Lengan Atas (LiLA) dalam cm (opsional)
- **Status Gizi (Validasi Indikator Standar WHO/Kemenkes):**
  - **BB/U** (Berat Badan menurut Umur): Sangat Kurang / Kurang / Normal / Risiko Lebih
  - **TB/U** (Tinggi Badan menurut Umur): Sangat Pendek / Pendek / Normal / Tinggi
  - **BB/TB** (Berat Badan menurut Tinggi Badan): Gizi Buruk / Gizi Kurang / Normal / Obesitas
- **Indikator Grafik KMS:** N (Naik), T (Tetap/Turun/Tidak naik), 2T (Dua kali berturut-turut tidak naik), B1/B6 (Baru pertama datang / Baru 6 bulan), O (Bulan lalu tidak datang)
- **Intervensi & Vitamin:** Vitamin A (Februari & Agustus), ASI Eksklusif (Ya/Tidak), Obat Cacing, Status Imunisasi Dasar

---

### Lansia — Identitas (Data Master — Diinput Sekali)
- No. Urut, Nama Lansia, NIK, No. BPJS, Kelompok Umur (45–59 tahun, 60–69 tahun, ≥70 tahun), Jenis Kelamin (L/P), Tanggal Lahir, Alamat / Domisili (RT/RW, Dusun/Desa)
- **Kondisi Awal / Skrining:**
  - Riwayat Penyakit: HT / Hipertensi (ya/tidak), DM / Diabetes Melitus (ya/tidak)
  - Tingkat Kemandirian (Kategori A/B/C)
  - Gangguan Mental Emosional (hasil skrining)

### Lansia — Riwayat Pemeriksaan Bulanan (Dinamis per Kunjungan) **[BARU: tabel terpisah]**
- Tanggal Kunjungan / Bulan Pemeriksaan
- **Hasil Pemeriksaan Fisik:**
  - Berat Badan (BB) dalam kg
  - Tinggi Badan (TB) dalam cm
  - Indeks Massa Tubuh (IMT)
  - Tekanan Darah (TD) — Sistole & Diastole (mmHg)
  - Lingkar Perut (LP) dalam cm
- **Hasil Pemeriksaan Laboratorium Sederhana:**
  - Gula Darah Sewaktu (GDS)
  - Kolesterol (opsional/jika ada)
  - Asam Urat (opsional/jika ada)
- **Skrining Kesehatan Mental & Kognitif (Bulanan / Evaluasi Periodik):**
  - Kemandirian (Aktivitas Harian)
  - Gangguan Mental Emosional
- **Keterangan / Tindakan:**
  - Penyakit / Keluhan yang diderita
  - Pemberian Kapsul / Obat (Kolom KET)
  - Rujukan (jika perlu)

---

## 10. Struktur Database (revisi)

```
Posyandu
├── id, nama, desa, kecamatan, alamat

Balita
├── id, posyandu_id, no_urut, nama, nik, tanggal_lahir, jenis_kelamin,
│   nama_ibu, alamat

PemeriksaanBalita  ← [BARU]
├── id, balita_id, tanggal_periksa, usia_bulan,
│   berat_badan, tinggi_badan, lingkar_kepala, lingkar_lengan_atas,
│   status_bb_u, status_tb_u, status_bb_tb, indikator_kms,
│   asi_eksklusif, vitamin_a, obat_cacing, status_imunisasi

Lansia
├── id, posyandu_id, no_urut, nama, nik, no_bpjs, rt_rw, tanggal_lahir,
│   jenis_kelamin, alamat, kelompok_umur, riwayat_ht, riwayat_dm,
│   tingkat_kemandirian, gangguan_mental_emosional

PemeriksaanLansia  ← [BARU]
├── id, lansia_id, tanggal_periksa,
│   berat_badan, tinggi_badan, imt, tekanan_darah_sistol,
│   tekanan_darah_diastol, gula_darah_sewaktu, lingkar_perut,
│   kolesterol, asam_urat, kemandirian_bulanan, mental_emosional_bulanan,
│   keluhan, pemberian_obat, rujukan
```

> Tabel `IbuHamil` & `PemeriksaanIbuHamil` disiapkan strukturnya di fase
> berikutnya mengikuti pola yang sama (identitas + riwayat pemeriksaan).

---

## 11. Alur Penggunaan

1. Pengguna membuka aplikasi → memilih Posyandu.
2. Sistem menampilkan dashboard Posyandu (total Balita, total Lansia,
   ringkasan status gizi/HT-DM).
3. Pengguna memilih modul Balita atau Lansia.
4. Pengguna menambah/mengubah data identitas, atau membuka Detail.
5. Di halaman Detail, pengguna menambah **hasil pemeriksaan bulan ini**
   (baris baru di riwayat, data lama tidak hilang).
6. Dashboard diperbarui sesuai perubahan data.

---

## 12. Arsitektur & Teknologi [REVISI]

Aplikasi dibangun dengan arsitektur **Decoupled Frontend-Backend (Client-Server)** untuk memastikan kode bersifat modular, reusable, mudah dirawat, dan skalabel di kemudian hari.

- **Frontend (Client):** Next.js (App Router / Pages Router) atau Vite + React, TypeScript, Tailwind CSS, dan shadcn/ui.
- **Backend (Server):** Node.js (Express.js / Fastify) atau NestJS dengan TypeScript, yang mengekspos RESTful API.
- **Database:** Supabase PostgreSQL.
- **ORM:** Prisma ORM (dijalankan di server-side).
- **Authentication:** Supabase Auth (diintegrasikan di frontend dengan token verifikasi di backend menggunakan JWT/Access Token).

---

## 13. Struktur Proyek Modular & Reusable [BARU]

Struktur proyek dirancang menggunakan struktur modular yang memisahkan client, server, dan kode bersama (shared package) guna mendukung reusability yang maksimal.

```
posyandu/
├── client/                 # Aplikasi Frontend (Client-side)
│   ├── public/             # Aset statis (logo, favicon, dll.)
│   ├── src/
│   │   ├── assets/         # Gambar, ikon, font lokal
│   │   ├── components/     # UI Components yang reusable
│   │   │   ├── ui/         # Komponen dasar (shadcn/ui: Button, Input, Dialog, dll.)
│   │   │   └── shared/     # Komponen layout bersama (Sidebar, Navbar, Layout)
│   │   ├── features/       # Modul fungsional (Feature-Based Structure)
│   │   │   ├── auth/       # Form login/register, hook auth, state auth
│   │   │   ├── dashboard/  # Tampilan & metrik dashboard
│   │   │   ├── balita/     # CRUD Balita, form pemeriksaan balita, list balita
│   │   │   └── lansia/     # CRUD Lansia, form pemeriksaan lansia, list lansia
│   │   ├── hooks/          # Custom React hooks (reusable logic)
│   │   ├── lib/            # Inisialisasi library (axios instansi, supabase client, utils)
│   │   ├── services/       # Layer komunikasi API (Axios/Fetch calls ke server)
│   │   ├── store/          # State management global (Zustand / Redux)
│   │   ├── types/          # Deklarasi tipe TypeScript khusus frontend
│   │   ├── App.tsx         # Entrypoint aplikasi utama
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── server/                 # Aplikasi Backend (Server-side API)
│   ├── prisma/             # Skema database Prisma & file migrasi
│   ├── src/
│   │   ├── config/         # Konfigurasi database, env, supabase, dll.
│   │   ├── controllers/    # Handler HTTP request/response
│   │   ├── middlewares/    # Auth guard, request validation, error handler
│   │   ├── models/         # Layer query database (menggunakan Prisma Client)
│   │   ├── routes/         # Definisi routing API endpoint
│   │   ├── services/       # Layer logika bisnis utama (business logic)
│   │   ├── utils/          # Fungsi pembantu (logger, kalkulator umur, dll.)
│   │   └── index.ts        # Entrypoint server (Express / Fastify app)
│   ├── package.json
│   └── tsconfig.json
│
└── shared/                 # Modul Bersama (Shared Code / Packages)
    ├── src/
    │   ├── constants/      # Konstanta bersama (kategori gizi, tingkat kemandirian)
    │   ├── schemas/        # Validasi skema (Zod) untuk request payload & form input
    │   └── types/          # Tipe data & DTO (Data Transfer Object) bersama
    ├── package.json
    └── tsconfig.json
```

### Keunggulan Desain Modular & Separated ini:
1. **Separation of Concerns (SoC):** Frontend murni menangani UI, interaksi pengguna, dan rendering. Backend berfokus pada logika bisnis, integritas data, validasi, dan persistensi database.
2. **Dry Principle (Shared Code):** Skema validasi request/form (misal menggunakan Zod) diletakkan di `/shared` dan dipakai baik oleh frontend (validasi sisi client) maupun backend (validasi sisi server), memastikan satu sumber kebenaran (Single Source of Truth).
3. **Feature-based Structure di Frontend:** Folder `features` membagi kode berdasarkan fungsionalitas bisnis, sehingga memudahkan pendelegasian tugas antar pengembang dan mencegah file konflik.
4. **Deployability Independen:** Client dan server terpisah sepenuhnya, memungkinan deploy independen (misal Client di Vercel, Server di Railway) serta kemudahan migrasi platform di masa mendatang.

---

## 14. Target MVP 

- Mengelola banyak Posyandu dalam satu sistem.
- Mencatat identitas + **riwayat pemeriksaan bulanan** Balita dan Lansia sesuai pola pencatatan asli di lapangan.
- Menampilkan dashboard ringkas per Posyandu, termasuk indikator gizi Balita dan indikator HT/DM Lansia.
- Menjadi fondasi siap-pakai untuk modul Ibu Hamil, grafik pertumbuhan WHO, laporan, dan integrasi AI di fase berikutnya.

