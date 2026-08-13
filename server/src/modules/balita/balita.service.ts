import prisma from '../../shared/config/prisma';
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb } from '../../shared/utils/zScoreCalculator';
import { hitungUsiaBulan, kelompokUsiaBulan } from './balita.helper';

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
          take: 1,
        },
      },
    });

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
          orderBy: { tanggalPeriksa: 'desc' },
        },
      },
    });
  },

  async create(posyanduId: string, data: any) {
    return prisma.balita.create({
      data: { ...data, posyanduId },
    });
  },

  async update(id: string, posyanduId: string, data: Parameters<typeof prisma.balita.update>[0]['data']) {
    return prisma.balita.update({ where: { id }, data });
  },

  async delete(id: string, posyanduId: string) {
    const balita = await prisma.balita.findFirst({ where: { id, posyanduId } });
    if (!balita) throw new Error('Balita tidak ditemukan');
    return prisma.balita.delete({ where: { id } });
  },

  // ── Pemeriksaan Balita ─────────────────────────────────────
  async findAllPemeriksaan(balitaId: string) {
    return prisma.pemeriksaanBalita.findMany({
      where: { balitaId },
      orderBy: { tanggalPeriksa: 'desc' },
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

    const usiaBulan = hitungUsiaBulan(balita.tanggalLahir, data.tanggalPeriksa);

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
