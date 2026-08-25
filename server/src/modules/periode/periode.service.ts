import prisma from '../../shared/config/prisma';
import { CreatePeriodeInput, UpdatePeriodeInput } from './periode.schema';

export const periodeService = {
  async findAllByPosyandu(posyanduId: string) {
    return prisma.periodePelayanan.findMany({
      where: { posyanduId },
      orderBy: [
        { status: 'asc' }, // AKTIF first
        { tanggal: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },

  async getActiveByPosyandu(posyanduId: string) {
    const active = await prisma.periodePelayanan.findFirst({
      where: { posyanduId, status: 'AKTIF' },
      orderBy: { tanggal: 'desc' },
    });

    if (active) return active;

    // Fallback: return the latest period if no active status
    return prisma.periodePelayanan.findFirst({
      where: { posyanduId },
      orderBy: { tanggal: 'desc' },
    });
  },

  async create(posyanduId: string, input: CreatePeriodeInput) {
    const status = input.status || 'AKTIF';

    // If setting to AKTIF, mark existing AKTIF periods as SELESAI
    if (status === 'AKTIF') {
      await prisma.periodePelayanan.updateMany({
        where: { posyanduId, status: 'AKTIF' },
        data: { status: 'SELESAI' },
      });
    }

    return prisma.periodePelayanan.create({
      data: {
        posyanduId,
        nama: input.nama,
        bulan: input.bulan,
        tahun: input.tahun,
        tanggal: new Date(input.tanggal),
        status,
        catatan: input.catatan || null,
      },
    });
  },

  async update(id: string, input: UpdatePeriodeInput) {
    const existing = await prisma.periodePelayanan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Periode pelayanan tidak ditemukan');
    }

    if (input.status === 'AKTIF' && existing.status !== 'AKTIF') {
      // Set others to SELESAI
      await prisma.periodePelayanan.updateMany({
        where: { posyanduId: existing.posyanduId, status: 'AKTIF' },
        data: { status: 'SELESAI' },
      });
    }

    return prisma.periodePelayanan.update({
      where: { id },
      data: {
        ...(input.nama !== undefined && { nama: input.nama }),
        ...(input.bulan !== undefined && { bulan: input.bulan }),
        ...(input.tahun !== undefined && { tahun: input.tahun }),
        ...(input.tanggal !== undefined && { tanggal: new Date(input.tanggal) }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.catatan !== undefined && { catatan: input.catatan }),
      },
    });
  },

  async activate(posyanduId: string, id: string) {
    await prisma.periodePelayanan.updateMany({
      where: { posyanduId, status: 'AKTIF' },
      data: { status: 'SELESAI' },
    });

    return prisma.periodePelayanan.update({
      where: { id },
      data: { status: 'AKTIF' },
    });
  },

  async delete(id: string) {
    const existing = await prisma.periodePelayanan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Periode pelayanan tidak ditemukan');
    }

    return prisma.periodePelayanan.delete({
      where: { id },
    });
  },
};
