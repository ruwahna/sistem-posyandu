import prisma from '../lib/prisma';
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb } from '../lib/zScoreCalculator';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

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

/**
 * Menentukan kelompok umur Lansia dalam tahun (BR-05).
 */
export function kelompokUmurLansia(tahun: number): string {
  if (tahun < 60) return '45-59 tahun (Pra-lansia)';
  if (tahun < 70) return '60-69 tahun';
  return '≥70 tahun';
}

// ─────────────────────────────────────────────────────────────
// SERVICE: POSYANDU
// ─────────────────────────────────────────────────────────────
export const posyanduService = {
  async findAll() {
    return prisma.posyandu.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { balitas: true, lansias: true, kaders: true },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.posyandu.findUnique({
      where: { id },
      include: {
        _count: {
          select: { balitas: true, lansias: true },
        },
      },
    });
  },

  async create(data: { nama: string; desa: string; kecamatan: string; alamat: string }) {
    return prisma.posyandu.create({ data });
  },

  async update(id: string, data: Partial<{ nama: string; desa: string; kecamatan: string; alamat: string }>) {
    return prisma.posyandu.update({ where: { id }, data });
  },

  async delete(id: string) {
    // Cek apakah masih ada balita atau lansia aktif (FR-04)
    const count = await prisma.posyandu.findUnique({
      where: { id },
      include: { _count: { select: { balitas: true, lansias: true } } },
    });
    if (count && (count._count.balitas > 0 || count._count.lansias > 0)) {
      throw new Error('Posyandu tidak dapat dihapus karena masih memiliki data Balita/Lansia');
    }
    return prisma.posyandu.delete({ where: { id } });
  },
};

// ─────────────────────────────────────────────────────────────
// SERVICE: DASHBOARD
// ─────────────────────────────────────────────────────────────
export const dashboardService = {
  /**
   * Mengambil semua metrik ringkasan untuk satu posyandu (FR-05 sd FR-09).
   */
  async getSummary(posyanduId: string) {
    const [
      totalBalita,
      totalLansia,
      pemeriksaanBalitaTerbaru,
      pemeriksaanLansiaTerbaru,
      lansiaHtDm,
    ] = await Promise.all([
      // FR-05
      prisma.balita.count({ where: { posyanduId } }),
      // FR-06
      prisma.lansia.count({ where: { posyanduId } }),
      // FR-09: 10 pemeriksaan balita terbaru
      prisma.pemeriksaanBalita.findMany({
        where: { balita: { posyanduId } },
        orderBy: { tanggalPeriksa: 'desc' },
        take: 10,
        include: { balita: { select: { nama: true, tanggalLahir: true } } },
      }),
      // FR-09: 10 pemeriksaan lansia terbaru
      prisma.pemeriksaanLansia.findMany({
        where: { lansia: { posyanduId } },
        orderBy: { tanggalPeriksa: 'desc' },
        take: 10,
        include: { lansia: { select: { nama: true, tanggalLahir: true } } },
      }),
      // FR-08
      prisma.lansia.findMany({
        where: { posyanduId },
        select: { riwayatHt: true, riwayatDm: true },
      }),
    ]);

    // FR-07: Ringkasan status gizi — hitung dari pemeriksaan terakhir tiap balita
    const balitasLatestExam = await prisma.$queryRaw<
      Array<{ status_bb_u: string; status_tb_u: string; status_bb_tb: string }>
    >`
      SELECT DISTINCT ON (pb.balita_id) pb.status_bb_u, pb.status_tb_u, pb.status_bb_tb
      FROM pemeriksaan_balita pb
      INNER JOIN balita b ON b.id = pb.balita_id
      WHERE b.posyandu_id = ${posyanduId}
      ORDER BY pb.balita_id, pb.tanggal_periksa DESC
    `;

    const statusGiziSummary = balitasLatestExam.reduce(
      (acc, exam) => {
        acc.bbU[exam.status_bb_u] = (acc.bbU[exam.status_bb_u] || 0) + 1;
        acc.tbU[exam.status_tb_u] = (acc.tbU[exam.status_tb_u] || 0) + 1;
        acc.bbTb[exam.status_bb_tb] = (acc.bbTb[exam.status_bb_tb] || 0) + 1;
        return acc;
      },
      { bbU: {} as Record<string, number>, tbU: {} as Record<string, number>, bbTb: {} as Record<string, number> }
    );

    const totalHt = lansiaHtDm.filter((l) => l.riwayatHt).length;
    const totalDm = lansiaHtDm.filter((l) => l.riwayatDm).length;
    const totalHtDm = lansiaHtDm.filter((l) => l.riwayatHt && l.riwayatDm).length;

    return {
      totalBalita,
      totalLansia,
      statusGizi: statusGiziSummary,
      lansiaHtDm: { totalHt, totalDm, totalHtDm },
      pemeriksaanTerbaru: {
        balita: pemeriksaanBalitaTerbaru,
        lansia: pemeriksaanLansiaTerbaru,
      },
    };
  },
};

// ─────────────────────────────────────────────────────────────
// SERVICE: BALITA
// ─────────────────────────────────────────────────────────────
export const balitaService = {
  async findAll(posyanduId: string, search?: string, kelompokUsia?: string) {
    const balitas = await prisma.balita.findMany({
      where: {
        posyanduId,
        ...(search && { nama: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { nama: 'asc' },
      include: {
        pemeriksaans: {
          orderBy: { tanggalPeriksa: 'desc' },
          take: 1, // Hanya ambil pemeriksaan terbaru
        },
      },
    });

    // FR-16: Hitung usia dan filter kelompok usia (BR-05)
    const result = balitas.map((b) => {
      const usiaBulan = hitungUsiaBulan(b.tanggalLahir);
      const kelompok = kelompokUsiaBulan(usiaBulan);
      return { ...b, usiaBulan, kelompokUsia: kelompok };
    });

    if (kelompokUsia) {
      return result.filter((b) => b.kelompokUsia === kelompokUsia);
    }
    return result;
  },

  async findById(id: string, posyanduId: string) {
    return prisma.balita.findFirst({
      where: { id, posyanduId },
      include: {
        pemeriksaans: {
          orderBy: { tanggalPeriksa: 'desc' }, // FR-20
        },
      },
    });
  },

  async create(posyanduId: string, data: Parameters<typeof prisma.balita.create>[0]['data']) {
    return prisma.balita.create({
      data: { ...data, posyanduId } as Parameters<typeof prisma.balita.create>[0]['data'],
    });
  },

  async update(id: string, posyanduId: string, data: Parameters<typeof prisma.balita.update>[0]['data']) {
    return prisma.balita.update({ where: { id }, data });
  },

  async delete(id: string, posyanduId: string) {
    // Verifikasi balita milik posyandu yang sama (tenant isolation)
    const balita = await prisma.balita.findFirst({ where: { id, posyanduId } });
    if (!balita) throw new Error('Balita tidak ditemukan');
    return prisma.balita.delete({ where: { id } });
  },

  // ── Pemeriksaan Balita ─────────────────────────────────────
  async findAllPemeriksaan(balitaId: string) {
    return prisma.pemeriksaanBalita.findMany({
      where: { balitaId },
      orderBy: { tanggalPeriksa: 'desc' }, // FR-20
    });
  },

  async createPemeriksaan(
    balitaId: string,
    data: {
      tanggalPeriksa: Date;
      beratBadan: number;
      tinggiBadan: number;
      lingkarKepala?: number;
      lingkarLengan?: number;
      statusBbU?: 'SK' | 'K' | 'N' | 'L';
      statusTbU?: 'SP' | 'P' | 'N' | 'T';
      statusBbTb?: 'SK' | 'K' | 'N' | 'G';
      statusKms?: string;
      vitaminA: boolean;
      asiEksklusif?: boolean;
      obatCacing?: boolean;
      statusImunisasi?: string;
    }
  ) {
    const balita = await prisma.balita.findUnique({ where: { id: balitaId } });
    if (!balita) throw new Error('Balita tidak ditemukan');

    // FR-16, BR-05: Hitung usia bulan otomatis saat periksa
    const usiaBulan = hitungUsiaBulan(balita.tanggalLahir, data.tanggalPeriksa);

    // Hitung status gizi secara otomatis (Z-Score)
    const statusBbU = hitungStatusBbU(Number(data.beratBadan), usiaBulan, balita.jenisKelamin);
    const statusTbU = hitungStatusTbU(Number(data.tinggiBadan), usiaBulan, balita.jenisKelamin);
    const statusBbTb = hitungStatusBbTb(Number(data.beratBadan), Number(data.tinggiBadan), balita.jenisKelamin);

    return prisma.pemeriksaanBalita.create({
      data: {
        ...data,
        statusBbU,
        statusTbU,
        statusBbTb,
        balitaId,
        usiaBulan,
      },
    });
  },

  async updatePemeriksaan(
    id: string,
    data: Partial<Parameters<typeof prisma.pemeriksaanBalita.update>[0]['data']>
  ) {
    return prisma.pemeriksaanBalita.update({ where: { id }, data });
  },

  async deletePemeriksaan(id: string) {
    return prisma.pemeriksaanBalita.delete({ where: { id } });
  },
};

// ─────────────────────────────────────────────────────────────
// SERVICE: LANSIA
// ─────────────────────────────────────────────────────────────
export const lansiaService = {
  async findAll(
    posyanduId: string,
    search?: string,
    kelompokUmur?: string,
    filterHt?: boolean,
    filterDm?: boolean
  ) {
    const lansias = await prisma.lansia.findMany({
      where: {
        posyanduId,
        ...(search && { nama: { contains: search, mode: 'insensitive' } }),
        ...(filterHt !== undefined && { riwayatHt: filterHt }), // FR-27
        ...(filterDm !== undefined && { riwayatDm: filterDm }), // FR-27
      },
      orderBy: { nama: 'asc' },
      include: {
        pemeriksaans: {
          orderBy: { tanggalPeriksa: 'desc' },
          take: 1,
        },
      },
    });

    // FR-27, BR-05: Hitung usia dan filter kelompok umur
    const result = lansias.map((l) => {
      const now = new Date();
      const tahun = now.getFullYear() - l.tanggalLahir.getFullYear();
      const kelompok = kelompokUmurLansia(tahun);
      return { ...l, usiaTahun: tahun, kelompokUmur: kelompok };
    });

    if (kelompokUmur) {
      return result.filter((l) => l.kelompokUmur === kelompokUmur);
    }
    return result;
  },

  async findById(id: string, posyanduId: string) {
    return prisma.lansia.findFirst({
      where: { id, posyanduId },
      include: {
        pemeriksaans: {
          orderBy: { tanggalPeriksa: 'desc' }, // FR-30
        },
      },
    });
  },

  async create(posyanduId: string, data: Parameters<typeof prisma.lansia.create>[0]['data']) {
    return prisma.lansia.create({
      data: { ...data, posyanduId } as Parameters<typeof prisma.lansia.create>[0]['data'],
    });
  },

  async update(id: string, posyanduId: string, data: Parameters<typeof prisma.lansia.update>[0]['data']) {
    const lansia = await prisma.lansia.findFirst({ where: { id, posyanduId } });
    if (!lansia) throw new Error('Lansia tidak ditemukan');
    return prisma.lansia.update({ where: { id }, data });
  },

  async delete(id: string, posyanduId: string) {
    const lansia = await prisma.lansia.findFirst({ where: { id, posyanduId } });
    if (!lansia) throw new Error('Lansia tidak ditemukan');
    return prisma.lansia.delete({ where: { id } });
  },

  // ── Pemeriksaan Lansia ─────────────────────────────────────
  async findAllPemeriksaan(lansiaId: string) {
    return prisma.pemeriksaanLansia.findMany({
      where: { lansiaId },
      orderBy: { tanggalPeriksa: 'desc' }, // FR-30
    });
  },

  async createPemeriksaan(
    lansiaId: string,
    data: {
      tanggalPeriksa: Date;
      beratBadan: number;
      tinggiBadan: number;
      tekananDarahSistol: number;
      tekananDarahDiastol: number;
      gulaDarahSewaktu: number;
      lingkarPerut: number;
      kolesterol?: number;
      asamUrat?: number;
      keluhan?: string;
      tindakan?: string;
    }
  ) {
    const lansia = await prisma.lansia.findUnique({ where: { id: lansiaId } });
    if (!lansia) throw new Error('Lansia tidak ditemukan');
    return prisma.pemeriksaanLansia.create({ data: { ...data, lansiaId } });
  },

  async updatePemeriksaan(
    id: string,
    data: Partial<Parameters<typeof prisma.pemeriksaanLansia.update>[0]['data']>
  ) {
    return prisma.pemeriksaanLansia.update({ where: { id }, data });
  },

  async deletePemeriksaan(id: string) {
    return prisma.pemeriksaanLansia.delete({ where: { id } });
  },
};
