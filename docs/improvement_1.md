Berdasarkan dokumen pencatatan manual pada gambar yang Anda lampirkan (baik dari buku register bulanan maupun catatan kunjungan), berikut adalah rincian data (entitas dan atribut) yang perlu diakomodasi ke dalam sistem digitalisasi Posyandu, dipisahkan untuk kategori Lansia dan Balita.

Untuk membangun sistem yang baik, struktur input sebaiknya dibagi menjadi Data Master (Data Statis) yang diisi sekali, dan Data Pemeriksaan (Data Dinamis) yang diisi setiap bulan saat kunjungan.

1. Kategori Posyandu Lansia
A. Data Master Lansia (Diinput Sekali)
No. Urut

Nama Lansia

No. NIK (Nomor Induk Kependudukan)

No. BPJS

Status/Kelompok Umur (Pilihan kategori berdasarkan form: 45–59 tahun, 60–69 tahun, atau > 70 tahun)

Jenis Kelamin (L/P)

Tanggal Lahir

Alamat / Domisili (RT/RW, Dusun/Desa)

B. Data Pemeriksaan Bulanan Lansia (Dinamis per Kunjungan)
Tanggal Kunjungan / Bulan Pemeriksaan (Contoh pada gambar: Januari, Februari, Maret, Mei, Juni)

Hasil Pemeriksaan Fisik:

Berat Badan (BB) dalam kg

Tinggi Badan (TB) dalam cm

Indeks Massa Tubuh (IMT)

Tekanan Darah (TD) — Sistole/Diastole (contoh: 130/80)

Lingkar Perut (LP) dalam cm

Hasil Pemeriksaan Laboratorium Sederhana:

Gula Darah Sewaktu (GDS)

Kolesterol (jika ada)

Asam Urat (jika ada)

Skrining Kesehatan Mental & Kognitif:

Kemandirian (Aktivitas Harian)

Gangguan Mental Emosional

Keterangan / Tindakan:

Penyakit yang diderita / keluhan

Pemberian Kapsul/Obat (Kolom KET pada gambar)

Rujukan (jika perlu)

2. Kategori Posyandu Balita
A. Data Master Balita & Orang Tua (Diinput Sekali)
No. Urut

Nama Balita

NIK Balita

Nama Ibu / Orang Tua

Jenis Kelamin (L/P)

Tanggal Lahir (Untuk menentukan kategori usia otomatis: 0–6 bln, 7–12 bln, 13–24 bln, 25–60 bln)

B. Data Pemeriksaan Bulanan Balita (Dinamis per Kunjungan)
Tanggal Kunjungan / Bulan Pemeriksaan

Hasil Antropometri (Pertumbuhan):

Berat Badan (BB) dalam kg

Tinggi/Panjang Badan (TB) dalam cm

Lingkar Lengan Atas (LiLA) dalam cm

Lingkar Kepala (LKA) dalam cm

Status Gizi (Validasi Indikator):

BB/U (Berat Badan menurut Umur): Sangat Kurang / Kurang / Normal / Risiko Lebih

TB/U (Tinggi Badan menurut Umur): Sangat Pendek / Pendek / Normal / Tinggi

BB/TB (Berat Badan menurut Tinggi Badan): Gizi Buruk / Gizi Kurang / Normal / Obesitas

Indikator Grafik KMS (Kartu Menuju Sehat):

N (Naik)

T (Tetap/Turun/Grafik tidak naik)

2T (Dua kali berturut-turut tidak naik)

B1 / B6 (Baru pertama kali datang / Baru berumur 6 bulan)

O (Bulan lalu tidak datang)

Intervensi & Vitamin:

ASI Eksklusif (Ya/Tidak)

Vitamin A (Pemberian di bulan Februari & Agustus)

Obat Cacing

Status Imunisasi Dasar (jika diintegrasikan)

💡 Tips Tambahan untuk Developer Sistem:
Otomatisasi Umur: Jangan biarkan kader menghitung umur manual. Sistem harus bisa menghitung Umur (dalam Bulan/Tahun) secara otomatis berdasarkan Tanggal Kunjungan minus Tanggal Lahir.

Kalkulator Z-Score Otomatis: Untuk penentuan Status Gizi Balita (BB/U, TB/U, BB/TB), Anda bisa menanamkan rumus standar WHO/Kemenkes agar status (Normal, Stunting, Underweight) langsung muncul otomatis begitu kader menginput BB dan TB.

Pemberitahuan Otomatis (Alert): Buat sistem pop-up warning jika ada balita berstatus 2T (2 kali tidak naik) agar kader bisa langsung memberikan tindakan atau rujukan ke Puskesmas.

  ### Keputusan yang Perlu Anda Konfirmasi:
  1. Penyimpanan Skrining Lansia: Apakah Anda setuju untuk memindahkan data tingkat kemandirian dan    
  kesehatan mental dari tabel master lansia ke tabel pemeriksaan bulanan agar bisa dilacak             
  perkembangannya dari waktu ke waktu?  
  (belum perlu, tidak perlu dieksekusi)