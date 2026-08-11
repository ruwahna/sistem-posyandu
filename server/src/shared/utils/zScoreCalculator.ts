interface Milestone {
  x: number; // age in months or height in cm
  median: number;
  sd: number;
}

const BBU_BOYS: Milestone[] = [
  { x: 0, median: 3.3, sd: 0.5 },
  { x: 6, median: 7.9, sd: 0.8 },
  { x: 12, median: 9.6, sd: 1.0 },
  { x: 24, median: 12.2, sd: 1.2 },
  { x: 36, median: 14.3, sd: 1.5 },
  { x: 48, median: 16.3, sd: 1.8 },
  { x: 60, median: 18.3, sd: 2.0 }
];

const BBU_GIRLS: Milestone[] = [
  { x: 0, median: 3.2, sd: 0.5 },
  { x: 6, median: 7.3, sd: 0.8 },
  { x: 12, median: 8.9, sd: 1.0 },
  { x: 24, median: 11.5, sd: 1.2 },
  { x: 36, median: 13.9, sd: 1.5 },
  { x: 48, median: 16.1, sd: 1.8 },
  { x: 60, median: 18.2, sd: 2.0 }
];

const TBU_BOYS: Milestone[] = [
  { x: 0, median: 49.9, sd: 2.0 },
  { x: 6, median: 67.6, sd: 2.5 },
  { x: 12, median: 75.7, sd: 3.0 },
  { x: 24, median: 87.8, sd: 3.5 },
  { x: 36, median: 96.1, sd: 4.0 },
  { x: 48, median: 103.3, sd: 4.5 },
  { x: 60, median: 110.0, sd: 5.0 }
];

const TBU_GIRLS: Milestone[] = [
  { x: 0, median: 49.1, sd: 2.0 },
  { x: 6, median: 65.7, sd: 2.5 },
  { x: 12, median: 74.0, sd: 3.0 },
  { x: 24, median: 86.4, sd: 3.5 },
  { x: 36, median: 95.1, sd: 4.0 },
  { x: 48, median: 102.7, sd: 4.5 },
  { x: 60, median: 109.4, sd: 5.0 }
];

const BBTB_BOYS: Milestone[] = [
  { x: 45, median: 2.4, sd: 0.4 },
  { x: 55, median: 4.3, sd: 0.5 },
  { x: 65, median: 7.3, sd: 0.7 },
  { x: 75, median: 9.5, sd: 0.9 },
  { x: 85, median: 11.5, sd: 1.1 },
  { x: 95, median: 14.0, sd: 1.3 },
  { x: 105, median: 17.0, sd: 1.6 },
  { x: 115, median: 20.5, sd: 2.0 },
  { x: 120, median: 22.0, sd: 2.1 }
];

const BBTB_GIRLS: Milestone[] = [
  { x: 45, median: 2.5, sd: 0.4 },
  { x: 55, median: 4.2, sd: 0.5 },
  { x: 65, median: 6.8, sd: 0.7 },
  { x: 75, median: 9.0, sd: 0.9 },
  { x: 85, median: 11.0, sd: 1.1 },
  { x: 95, median: 13.5, sd: 1.3 },
  { x: 105, median: 16.5, sd: 1.6 },
  { x: 115, median: 20.0, sd: 2.0 },
  { x: 120, median: 21.5, sd: 2.1 }
];

function interpolate(x: number, milestones: Milestone[]): { median: number; sd: number } {
  if (x <= milestones[0].x) {
    return { median: milestones[0].median, sd: milestones[0].sd };
  }
  if (x >= milestones[milestones.length - 1].x) {
    return { median: milestones[milestones.length - 1].median, sd: milestones[milestones.length - 1].sd };
  }

  for (let i = 0; i < milestones.length - 1; i++) {
    const m1 = milestones[i];
    const m2 = milestones[i + 1];
    if (x >= m1.x && x <= m2.x) {
      const ratio = (x - m1.x) / (m2.x - m1.x);
      const median = m1.median + ratio * (m2.median - m1.median);
      const sd = m1.sd + ratio * (m2.sd - m1.sd);
      return { median, sd };
    }
  }

  return { median: milestones[0].median, sd: milestones[0].sd };
}

export function hitungZScore(
  val: number,
  x: number,
  milestones: Milestone[]
): number {
  const { median, sd } = interpolate(x, milestones);
  if (sd === 0) return 0;
  return (val - median) / sd;
}

export function hitungStatusBbU(
  beratBadan: number,
  usiaBulan: number,
  jenisKelamin: 'L' | 'P'
): 'SK' | 'K' | 'N' | 'L' {
  const milestones = jenisKelamin === 'L' ? BBU_BOYS : BBU_GIRLS;
  const zScore = hitungZScore(beratBadan, usiaBulan, milestones);

  if (zScore < -3) return 'SK'; // Sangat Kurang
  if (zScore < -2) return 'K';  // Kurang
  if (zScore <= 1) return 'N';  // Normal
  return 'L';                   // Lebih
}

export function hitungStatusTbU(
  tinggiBadan: number,
  usiaBulan: number,
  jenisKelamin: 'L' | 'P'
): 'SP' | 'P' | 'N' | 'T' {
  const milestones = jenisKelamin === 'L' ? TBU_BOYS : TBU_GIRLS;
  const zScore = hitungZScore(tinggiBadan, usiaBulan, milestones);

  if (zScore < -3) return 'SP'; // Sangat Pendek
  if (zScore < -2) return 'P';  // Pendek
  if (zScore <= 3) return 'N';  // Normal
  return 'T';                   // Tinggi
}

export function hitungStatusBbTb(
  beratBadan: number,
  tinggiBadan: number,
  jenisKelamin: 'L' | 'P'
): 'SK' | 'K' | 'N' | 'G' {
  const milestones = jenisKelamin === 'L' ? BBTB_BOYS : BBTB_GIRLS;
  const zScore = hitungZScore(beratBadan, tinggiBadan, milestones);

  if (zScore < -3) return 'SK'; // Sangat Kurus
  if (zScore < -2) return 'K';  // Kurus
  if (zScore <= 1) return 'N';  // Normal
  return 'G';                   // Gemuk
}

// Hitung IMT Lansia
export function hitungIMT(beratBadan: number, tinggiBadan: number): number {
  if (tinggiBadan <= 0) return 0;
  const tbMeter = tinggiBadan / 100;
  return Number((beratBadan / (tbMeter * tbMeter)).toFixed(1));
}
