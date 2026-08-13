/**
 * Menentukan kelompok umur Lansia dalam tahun (BR-05).
 */
export function kelompokUmurLansia(tahun: number): string {
  if (tahun < 60) return '45-59 tahun (Pra-lansia)';
  if (tahun < 70) return '60-69 tahun';
  return '≥70 tahun';
}
