import prisma from '../../shared/config/prisma';
import { kelompokUmurLansia } from './lansia.helper';

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
        ...(filterHt !== undefined && { riwayatHt: filterHt }),
        ...(filterDm !== undefined && { riwayatDm: filterDm }),
      },
      orderBy: { nama: 'asc' },
      include: {
        pemeriksaans: {
          orderBy: { tanggalPeriksa: 'desc' },
          take: 1,
        },
      },
    });

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
          orderBy: { tanggalPeriksa: 'desc' },
        },
      },
    });
  },

  async create(posyanduId: string, data: any) {
    return prisma.lansia.create({
      data: { ...data, posyanduId },
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
      orderBy: { tanggalPeriksa: 'desc' },
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
