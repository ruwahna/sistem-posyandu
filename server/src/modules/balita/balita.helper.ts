/**
 * Menghitung usia dalam bulan dari tanggal lahir ke tanggal referensi.
 * Digunakan saat input pemeriksaan Balita (BR-05).
 */
export function hitungUsiaBulan(tanggalLahir: Date, tanggalReferensi: Date = new Date()): number {
  const tahun = tanggalReferensi.getFullYear() - tanggalLahir.getFullYear();
  const bulan = tanggalReferensi.getMonth() - tanggalLahir.getMonth();
  return tahun * 12 + bulan;
}

/**
 * Menentukan kelompok usia Balita dari jumlah bulan (BR-05).
 */
export function kelompokUsiaBulan(usiaBulan: number): string {
  if (usiaBulan <= 6) return '0-6 bulan';
  if (usiaBulan <= 12) return '7-12 bulan';
  if (usiaBulan <= 24) return '13-24 bulan';
  return '25-60 bulan';
}
