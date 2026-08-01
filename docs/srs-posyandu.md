# Software Requirements Specification (SRS)
# Sistem Informasi Posyandu — MVP v1 (Balita & Lansia)

**Versi:** 1.0
**Berdasarkan:** Project Brief Posyandu v1 + observasi register fisik
Posyandu Balita "Sri Lestari" (Desa Karanggayam) dan register Kunjungan
Lansia Puskesmas Karanggayam I, Tahun 2026.

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini menjelaskan kebutuhan fungsional dan non-fungsional dari Sistem
Informasi Posyandu tahap MVP, mencakup modul **Balita** dan **Lansia**.
Modul **Ibu Hamil** disiapkan strukturnya tetapi implementasinya menyusul
pada fase berikutnya.

### 1.2 Ruang Lingkup
Sistem berbasis web, multi-posyandu, digunakan oleh Admin dan Kader
Posyandu untuk mencatat data identitas peserta serta riwayat pemeriksaan
kesehatan bulanan.

### 1.3 Definisi & Istilah

| Istilah | Arti |
|---|---|
| Posyandu | Pos Pelayanan Terpadu tingkat desa/dusun |
| Kader | Petugas sukarela yang menjalankan kegiatan Posyandu |
| BB/U | Indikator status gizi: Berat Badan menurut Umur |
| TB/U | Indikator status gizi: Tinggi Badan menurut Umur |
| BB/TB | Indikator status gizi: Berat Badan menurut Tinggi Badan |
| Kategori gizi | N=Normal, K=Kurang, SK=Sangat Kurang, L=Lebih, P=Pendek, SP=Sangat Pendek, T=Tinggi, G=Gemuk |
| HT | Hipertensi (riwayat penyakit tekanan darah tinggi) |
| DM | Diabetes Melitus |
| TD | Tekanan Darah (format sistol/diastol, mis. 130/85) |
| GDS | Gula Darah Sewaktu |
| LP | Lingkar Perut |
| LILA | Lingkar Lengan Atas (khusus Ibu Hamil, fase berikutnya) |
| BPJS | Nomor kepesertaan jaminan kesehatan |
| Kemandirian Lansia | Kategori A (mandiri), B (perlu bantuan sebagian), C (tergantung total) |
| Vit A | Vitamin A, diberikan pada Balita usia tertentu |
| Riwayat Pemeriksaan | Kumpulan hasil pemeriksaan dari waktu ke waktu (per bulan) untuk satu individu |

### 1.4 Referensi
- Project Brief Posyandu v1
- Register Posyandu Balita "Sri Lestari" Tahun 2026
- Register Kunjungan Lansia Puskesmas Karanggayam I Tahun 2026

---

## 2. Deskripsi Umum Sistem

### 2.1 Perspektif Produk
Aplikasi web baru (bukan pengganti sistem lama), menggantikan pencatatan
manual di buku register kertas untuk 2 modul: Balita dan Lansia.

### 2.2 Karakteristik Pengguna

| Peran | Deskripsi | Akses Data |
|---|---|---|
| Admin | Mengelola seluruh Posyandu | Semua Posyandu, semua data |
| Kader | Bertugas di 1 Posyandu tertentu | Hanya Posyandu miliknya |

### 2.3 Batasan Sistem
- Autentikasi/role-based access **belum diimplementasi penuh** di MVP;
  disiapkan strukturnya untuk fase berikutnya (Supabase Auth).
- Tidak ada integrasi API BPJS/Puskesmas — nomor BPJS hanya field teks.
- Tidak ada grafik pertumbuhan WHO di MVP — hanya tabel riwayat.
- Aplikasi diasumsikan digunakan online (koneksi internet tersedia saat
  input); tidak ada mode offline di MVP.

### 2.4 Asumsi & Ketergantungan
- Satu individu (Balita/Lansia) hanya terdaftar di satu Posyandu.
- Satu individu dapat memiliki banyak baris riwayat pemeriksaan
  (idealnya 1 per bulan, tapi sistem tidak memaksa jarak waktu tertentu).
- Field NIK bersifat opsional karena tidak semua warga (terutama balita)
  memiliki NIK saat pendaftaran.

---

## 3. Kebutuhan Fungsional

### 3.1 Modul Posyandu (Admin)

| ID | Kebutuhan |
|---|---|
| FR-01 | Sistem dapat menampilkan daftar seluruh Posyandu |
| FR-02 | Admin dapat menambah Posyandu baru (nama, desa, kecamatan, alamat) |
| FR-03 | Admin dapat mengubah data Posyandu |
| FR-04 | Admin dapat menghapus Posyandu (dengan konfirmasi, dan hanya jika tidak punya data anak yang aktif atau via soft-delete) |

### 3.2 Dashboard Posyandu

| ID | Kebutuhan |
|---|---|
| FR-05 | Sistem menampilkan total Balita terdaftar di Posyandu terpilih |
| FR-06 | Sistem menampilkan total Lansia terdaftar di Posyandu terpilih |
| FR-07 | Sistem menampilkan ringkasan status gizi Balita (jumlah per kategori BB/U, TB/U, BB/TB pada pemeriksaan terakhir) |
| FR-08 | Sistem menampilkan ringkasan jumlah Lansia dengan riwayat HT dan/atau DM |
| FR-09 | Sistem menampilkan daftar pemeriksaan terbaru (Balita & Lansia) |
| FR-10 | Sistem menyediakan tombol pintas untuk menambah data baru dari dashboard |

### 3.3 Modul Balita — Identitas

| ID | Kebutuhan |
|---|---|
| FR-11 | Kader/Admin dapat menambah data Balita: no_urut, nama, NIK, tanggal lahir, jenis kelamin, nama ibu, alamat |
| FR-12 | Kader/Admin dapat mengubah data identitas Balita |
| FR-13 | Kader/Admin dapat menghapus data Balita |
| FR-14 | Sistem menampilkan daftar Balita per Posyandu, dengan pencarian nama dan filter kelompok usia |
| FR-15 | Sistem menampilkan halaman Detail Balita berisi identitas + riwayat pemeriksaan |
| FR-16 | Sistem menghitung otomatis usia Balita (dalam bulan) dari tanggal lahir, dan menentukan kelompok usia (0–6, 7–12, 13–24, 25–60 bulan) |

### 3.4 Modul Balita — Riwayat Pemeriksaan

| ID | Kebutuhan |
|---|---|
| FR-17 | Kader dapat menambah entri pemeriksaan baru untuk seorang Balita: tanggal periksa, berat badan (BB), tinggi/panjang badan (TB), lingkar kepala (LKA, opsional), lingkar lengan atas (LiLA, opsional) |
| FR-18 | Kader/Sistem menentukan status gizi BB/U, TB/U, dan BB/TB dari daftar indikator standar (WHO/Kemenkes) |
| FR-19 | Kader mencatat status Vitamin A, ASI Eksklusif, Obat Cacing, Status Imunisasi Dasar, dan Indikator Grafik KMS (N, T, 2T, B1/B6, O) pada entri pemeriksaan |
| FR-20 | Sistem menampilkan seluruh riwayat pemeriksaan seorang Balita terurut dari yang terbaru |
| FR-21 | Kader/Admin dapat mengubah atau menghapus entri pemeriksaan yang salah input |

### 3.5 Modul Lansia — Identitas

| ID | Kebutuhan |
|---|---|
| FR-22 | Kader/Admin dapat menambah data Lansia: no_urut, nama, NIK, nomor BPJS, tanggal lahir, jenis kelamin, RT/RW, alamat |
| FR-23 | Kader/Admin mencatat riwayat penyakit Lansia: HT (ya/tidak), DM (ya/tidak) |
| FR-24 | Kader/Admin mencatat tingkat kemandirian Lansia (kategori A/B/C) |
| FR-25 | Kader/Admin mencatat catatan gangguan mental emosional (teks bebas atau skala sederhana) |
| FR-26 | Kader/Admin dapat mengubah dan menghapus data identitas Lansia |
| FR-27 | Sistem menampilkan daftar Lansia per Posyandu dengan pencarian nama dan filter kelompok umur (45–59, 60–69, ≥70) dan filter HT/DM |
| FR-28 | Sistem menampilkan halaman Detail Lansia berisi identitas + riwayat pemeriksaan |

### 3.6 Modul Lansia — Riwayat Pemeriksaan

| ID | Kebutuhan |
|---|---|
| FR-29 | Kader dapat menambah entri pemeriksaan baru untuk seorang Lansia: tanggal periksa, BB, TB, IMT, tekanan darah (sistol/diastol), GDS, lingkar perut, kolesterol, asam urat, evaluasi kemandirian, skrining mental emosional, keluhan/penyakit, obat/kapsul, dan rujukan |
| FR-30 | Sistem menampilkan seluruh riwayat pemeriksaan seorang Lansia terurut dari yang terbaru |
| FR-31 | Kader/Admin dapat mengubah atau menghapus entri pemeriksaan yang salah input |

### 3.7 Disiapkan untuk Fase Berikutnya (bukan MVP, hanya cantuman struktur)

| ID | Kebutuhan |
|---|---|
| FR-32 | (Next phase) Modul Ibu Hamil: identitas + riwayat pemeriksaan (HPHT, berat badan, tekanan darah, LILA per kunjungan) mengikuti pola yang sama seperti Balita/Lansia |

---

## 4. Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-01 | Usability | Formulir input dioptimalkan untuk pengguna non-teknis (kader), field yang jarang diisi ditandai opsional |
| NFR-02 | Performance | Halaman daftar (list) memuat dalam < 2 detik untuk hingga 500 data per Posyandu |
| NFR-03 | Data Integrity | Riwayat pemeriksaan tidak boleh menimpa (overwrite) data pemeriksaan sebelumnya — selalu insert baris baru |
| NFR-04 | Scalability | Struktur data mendukung penambahan Posyandu baru tanpa migrasi skema |
| NFR-05 | Security (fase berikutnya) | Data Kader hanya bisa mengakses Posyandu miliknya sendiri setelah auth diimplementasikan |
| NFR-06 | Maintainability | Struktur tabel `PemeriksaanBalita`/`PemeriksaanLansia` dirancang agar pola yang sama dapat dipakai ulang untuk modul Ibu Hamil |
| NFR-07 | Compatibility | Aplikasi dapat diakses dengan baik dari perangkat mobile (kader sering input langsung dari HP di lokasi Posyandu) |

---

## 5. Model Data (ERD Ringkas)

```
Posyandu (1) ────< (N) Balita (1) ────< (N) PemeriksaanBalita
Posyandu (1) ────< (N) Lansia (1) ────< (N) PemeriksaanLansia
```

### 5.1 Tabel: Posyandu
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| nama | string | |
| desa | string | |
| kecamatan | string | |
| alamat | string | |

### 5.2 Tabel: Balita
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| posyandu_id | FK | |
| no_urut | integer | nullable |
| nama | string | |
| nik | string | nullable |
| tanggal_lahir | date | |
| jenis_kelamin | enum(L/P) | |
| nama_ibu | string | |
| alamat | string | |

### 5.3 Tabel: PemeriksaanBalita
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| balita_id | FK | |
| tanggal_periksa | date | |
| usia_bulan | integer | dihitung otomatis, disimpan untuk histori |
| berat_badan | decimal | kg |
| tinggi_badan | decimal | cm |
| lingkar_kepala | decimal | nullable, cm |
| lingkar_lengan_atas | decimal | nullable, cm |
| status_bb_u | enum | SK/K/N/L |
| status_tb_u | enum | SP/P/N/T |
| status_bb_tb | enum | SK/K/N/G |
| indikator_kms | enum | N/T/2T/B1/B6/O |
| asi_eksklusif | boolean | nullable |
| vitamin_a | boolean | |
| obat_cacing | boolean | nullable |
| status_imunisasi | string | nullable |

### 5.4 Tabel: Lansia
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| posyandu_id | FK | |
| no_urut | integer | nullable |
| nama | string | |
| nik | string | |
| no_bpjs | string | nullable |
| rt_rw | string | nullable |
| tanggal_lahir | date | |
| jenis_kelamin | enum(L/P) | |
| alamat | string | |
| kelompok_umur | enum | 45-59 / 60-69 / >=70 |
| riwayat_ht | boolean | |
| riwayat_dm | boolean | |
| tingkat_kemandirian | enum(A/B/C) | |
| gangguan_mental_emosional | text | nullable |

### 5.5 Tabel: PemeriksaanLansia
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/PK | |
| lansia_id | FK | |
| tanggal_periksa | date | |
| berat_badan | decimal | kg |
| tinggi_badan | decimal | cm |
| imt | decimal | nullable |
| tekanan_darah_sistol | integer | mmHg |
| tekanan_darah_diastol | integer | mmHg |
| gula_darah_sewaktu | decimal | mg/dL |
| lingkar_perut | decimal | cm |
| kolesterol | decimal | nullable, mg/dL |
| asam_urat | decimal | nullable, mg/dL |
| kemandirian_bulanan | enum(A/B/C) | nullable |
| mental_emosional_bulanan | text | nullable |
| keluhan | text | nullable |
| pemberian_obat | text | nullable |
| rujukan | boolean | nullable |

---

## 6. Use Case Utama

### UC-01: Kader Menambah Hasil Pemeriksaan Bulanan Balita
1. Kader memilih Posyandu → membuka daftar Balita.
2. Kader memilih seorang Balita → membuka halaman Detail.
3. Kader menekan "Tambah Pemeriksaan".
4. Kader mengisi tanggal, BB, TB, (lingkar kepala opsional), memilih
   kategori status gizi, dan status Vitamin A.
5. Sistem menyimpan sebagai baris baru di riwayat pemeriksaan Balita
   tersebut (data sebelumnya tetap ada).
6. Dashboard dan ringkasan status gizi Posyandu diperbarui.

### UC-02: Kader Menambah Hasil Pemeriksaan Bulanan Lansia
1. Kader memilih Posyandu → membuka daftar Lansia.
2. Kader memilih seorang Lansia → membuka halaman Detail.
3. Kader menekan "Tambah Pemeriksaan".
4. Kader mengisi tanggal, BB, TB, tekanan darah, GDS, lingkar perut.
5. Sistem menyimpan sebagai baris baru di riwayat pemeriksaan Lansia
   tersebut.
6. Dashboard ringkasan HT/DM diperbarui bila relevan.

### UC-03: Admin Mengelola Posyandu
1. Admin membuka Daftar Posyandu.
2. Admin menambah/mengubah/menghapus Posyandu.
3. Sistem memvalidasi bahwa Posyandu yang dihapus tidak memiliki data
   Balita/Lansia aktif (atau menerapkan soft-delete).

---

## 7. Aturan Bisnis & Validasi

- BR-01: Tanggal pemeriksaan tidak boleh lebih besar dari tanggal hari ini.
- BR-02: Tanggal lahir tidak boleh lebih besar dari tanggal hari ini.
- BR-03: Berat badan dan tinggi badan harus berupa angka positif.
- BR-04: NIK, jika diisi, harus berjumlah 16 digit numerik.
- BR-05: Kelompok usia Balita dan kelompok umur Lansia dihitung otomatis
  oleh sistem, tidak diinput manual oleh kader (mengurangi human error
  yang terlihat di register manual, mis. usia tidak konsisten).
- BR-06: Satu Balita/Lansia hanya terhubung ke satu Posyandu; tidak bisa
  pindah Posyandu tanpa proses transfer data secara eksplisit (di luar
  scope MVP, dicatat sebagai catatan risiko).

---

## 8. Ringkasan Antarmuka Pengguna

| Halaman | Isi Utama |
|---|---|
| Daftar Posyandu | Tabel/list Posyandu + tombol tambah |
| Dashboard Posyandu | Kartu ringkasan (total Balita, total Lansia, status gizi, HT/DM) + daftar pemeriksaan terbaru |
| Daftar Balita | Tabel dengan pencarian & filter usia |
| Form Balita | Field identitas Balita |
| Detail Balita | Identitas + tabel riwayat pemeriksaan + tombol tambah pemeriksaan |
| Form Pemeriksaan Balita | BB, TB, lingkar kepala, status gizi, Vit A |
| Daftar Lansia | Tabel dengan pencarian & filter umur/HT-DM |
| Form Lansia | Field identitas + riwayat penyakit + kemandirian |
| Detail Lansia | Identitas + tabel riwayat pemeriksaan + tombol tambah pemeriksaan |
| Form Pemeriksaan Lansia | BB, TB, TD, GDS, LP |

---

## 9. Lampiran — Kategori Referensi

### 9.1 Kategori Status Gizi Balita
| Indikator | Kategori |
|---|---|
| BB/U | SK (Sangat Kurang), K (Kurang), N (Normal), L (Lebih) |
| TB/U | SP (Sangat Pendek), P (Pendek), N (Normal), T (Tinggi) |
| BB/TB | SK (Sangat Kurus), K (Kurus), N (Normal), G (Gemuk) |

### 9.2 Kategori Kemandirian Lansia
| Kode | Arti |
|---|---|
| A | Mandiri sepenuhnya |
| B | Perlu bantuan sebagian |
| C | Tergantung total pada orang lain |

### 9.3 Kelompok Usia
| Modul | Kelompok |
|---|---|
| Balita | 0–6 bln, 7–12 bln, 13–24 bln, 25–60 bln |
| Lansia | 45–59 th (pra-lansia), 60–69 th, ≥70 th |
