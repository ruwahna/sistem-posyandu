# Pembagian Tugas Tim Pengembang (Team Task Distribution)
**Sistem Informasi Posyandu (Posyandu Web Application)**

---

## 📌 Ringkasan Rekapitulasi Poin Pekerjaan (Total 20 Poin)

| Status | Jumlah | Poin Pekerjaan |
| :--- | :---: | :--- |
| **Selesai (Done)** | 14 Poin | Poin 1, 2, 3, 4, 5, 6, 7, 10, 11, 13, 14, 15, 16, 17 |
| **Dalam Pengerjaan (Assigned)** | 6 Poin | Poin 8, 9, 12, 18, 19, 20 |

---

## 👨‍💻 Pembagian Tugas Berdasarkan Level

### 🥇 1. WAHYU (✅ Selesai 5/5 Task)
> **Fokus Utama**: Arsitektur Backend Risiko Tinggi, Sistem Keamanan, Integrasi Mailer, Theme System, Notifikasi Real-Time & Fitur Destruktif/Owner.

| Poin | Nama Task | Deskripsi Pekerjaan | Status |
| :---: | :--- | :--- | :---: |
| **Poin 10** | Tren Grafik Gizi Balita (Bulanan/Tahunan) | • Membuat query agregasi data historis di backend.<br>• Mengintegrasikan filter periode (Bulanan vs Tahunan) pada grafik Recharts.<br>• Kalkulasi presisi kurva Z-score WHO balita. | ✅ Selesai |
| **Poin 14** | Integrasi API Sistem Notifikasi Real | • Menghubungkan UI Notifikasi dengan Database API server.<br>• Mengelola state notifikasi (dibaca / belum dibaca) & aksi *mark as read*. | ✅ Selesai |
| **Poin 15** | Integrasi Dark Mode & System Theme Preference | • Menghubungkan Theme Context dengan CSS Variable / Tailwind.<br>• Integrasi auto-detect tema OS (`prefers-color-scheme`). | ✅ Selesai |
| **Poin 16** | System Mailer / Email Notification Worker | • Integrasi Nodemailer / Service Email SMTP.<br>• Membuat template HTML email pengingat Posyandu.<br>• Background job/worker untuk jadwal pengiriman email otomatis. | ✅ Selesai |
| **Poin 17** | Backup Database, Audit Log & Reset Data Posyandu (Owner) | • Fitur Ekspor & Backup Data Sistem (.json / .sql dump).<br>• Pencatatan Log Aktivitas Pengguna (Audit Log).<br>• Fitur destruktif **Reset Semua Data Posyandu** khusus **Owner** dengan verifikasi ganda. | ✅ Selesai |

---

### 🥈 2. INDAH
> **Fokus Utama**: Integrasi Feature Full-Stack, Pagination Data, Laporan PDF/Excel, & Integrasi Dashboard Gizi.

| Poin | Nama Task | Deskripsi Pekerjaan |
| :---: | :--- | :--- |
| **Poin 12** | Backend & Frontend Pagination (Balita & Lansia) | • Menambahkan parameter `page` & `limit` pada backend Prisma API.<br>• Mengubah komponen tabel Balita & Lansia menggunakan komponen Reusable Pagination. |
| **Poin 18** | Generate Laporan Posyandu ke PDF | • Membuat generator dokumen PDF laporan Posyandu (.pdf) lengkap dengan kop/header resmi Posyandu, tabel rekapitulasi, dan ttd. |
| **Poin 19** | Integrasi Tren Status Gizi Balita (Menggantikan Mockup) | • Mengintegrasikan widget tren status gizi balita di Dashboard dengan data real dari API backend. |

---

### 🥉 3. DIMAS
> **Fokus Utama**: Validasi Form Input, Interaksi UI Komponen Aktivitas, Action Dropdown Menu, & Integrasi Grafik Distribusi RT/RW.

| Poin | Nama Task | Deskripsi Pekerjaan |
| :---: | :--- | :--- |
| **Poin 8** | Validasi Input Nilai Negatif pada Form Fisik / Medis | • Menambahkan validasi `min="0"` dan pencegahan input angka negatif pada form pengukuran BB, TB, LiLA, Tensi, GDS.<br>• Menampilkan pesan peringatan jika user mengetik angka `< 0`. |
| **Poin 9** | Aktivitas Kunjungan - Partisipasi & Implementasi Action Menu Dropdown (Icon Titik 3) | • Mengaktifkan fitur klik tombol titik 3 (`MoreHorizontal`) pada list aktivitas kunjungan.<br>• Menampilkan dropdown aksi cepat (Lihat Detail, Edit, Hapus).<br>• Menampilkan indikator tingkat partisipasi kader & posyandu. |
| **Poin 20** | Distribusi Kehadiran RT/RW (Menggantikan Mockup) | • Mengintegrasikan widget data distribusi kehadiran peserta Posyandu per wilayah RT/RW dengan data real backend. |

---

## 📊 Matriks Ringkas Pembagian Tugas

| No | Poin Pekerjaan | Penanggung Jawab | Status |
| :-: | :--- | :-: | :-: |
| 1 | Manajemen akun admin masih mockup | - | ✅ Selesai |
| 2 | Notifikasi masih belum hilang otomatis | - | ✅ Selesai |
| 3 | Bagian mobile Riwayat ditombol export excel disesuaikan | - | ✅ Selesai |
| 4 | Bagian profil belum bisa diklik | - | ✅ Selesai |
| 5 | Hasil input pemeriksaan belum masuk ke Riwayat | - | ✅ Selesai |
| 6 | Fitur reset password dengan verifikasi email | - | ✅ Selesai |
| 7 | Edit profil Tanggal kereset jika dibuka | - | ✅ Selesai |
| 8 | Validasi Input Nilai Negatif pada Form Fisik / Medis | **Dimas** | ⚙️ Assigned |
| 9 | Aktivitas Kunjungan (Partisipasi Kader & Menu Titik 3) | **Dimas** | ⚙️ Assigned |
| 10 | Tren Grafik Gizi Balita (Bulanan/Tahunan) | **Wahyu** | ✅ Selesai |
| 11 | Bagian tanggal belum bisa diklik manual | - | ✅ Selesai |
| 12 | Backend & Frontend Pagination (Balita & Lansia) | **Indah** | ⚙️ Assigned |
| 13 | Edit riwayat hasil input | - | ✅ Selesai |
| 14 | Integrasi API Sistem Notifikasi Real | **Wahyu** | ✅ Selesai |
| 15 | Integrasi Dark Mode & System Theme Preference | **Wahyu** | ✅ Selesai |
| 16 | System Mailer / Email Notification Worker | **Wahyu** | ✅ Selesai |
| 17 | Backup Database, Audit Log & Reset Data Posyandu (Owner) | **Wahyu** | ✅ Selesai |
| 18 | Generate Laporan Posyandu ke PDF | **Indah** | ⚙️ Assigned |
| 19 | Integrasi Tren Status Gizi Balita | **Indah** | ⚙️ Assigned |
| 20 | Distribusi Kehadiran RT/RW | **Dimas** | ⚙️ Assigned |

---
*Dokumen ini dibuat secara otomatis sebagai panduan kerja tim sistem Posyandu.*
