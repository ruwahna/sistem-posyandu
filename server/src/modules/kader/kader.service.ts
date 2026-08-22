import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../shared/config/prisma';

export const kaderService = {
  async getKadersByPosyandu(posyanduId: string) {
    return prisma.kader.findMany({
      where: { posyanduId },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async createKader(posyanduId: string, data: { nama: string; username?: string; email: string; password: string; role?: string }) {
    const { nama, username, email, password, role } = data;

    const existing = await prisma.kader.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('Email sudah terdaftar sebagai akun kader di sistem');
      (err as any).statusCode = 409;
      throw err;
    }

    // Validasi uniqueness username jika diisi
    if (username && username.trim()) {
      const existingUsername = await prisma.kader.findUnique({ where: { username: username.trim() } });
      if (existingUsername) {
        const err = new Error('Username sudah digunakan oleh akun lain');
        (err as any).statusCode = 409;
        throw err;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.kader.create({
      data: {
        id: uuidv4(),
        nama,
        username: username?.trim() || null,
        email,
        password: hashedPassword,
        posyanduId,
        role: role === 'OWNER' ? 'OWNER' : 'KADER',
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  async updateKaderRole(posyanduId: string, kaderId: string, currentUserId: string, role: 'OWNER' | 'KADER') {
    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      const err = new Error('Akun kader tidak ditemukan di posyandu ini');
      (err as any).statusCode = 404;
      throw err;
    }

    if (targetKader.id === currentUserId && role !== 'OWNER') {
      const ownerCount = await prisma.kader.count({
        where: { posyanduId, role: 'OWNER', isActive: true },
      });
      if (ownerCount <= 1) {
        const err = new Error('Posyandu harus memiliki minimal 1 Kader Owner aktif.');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    return prisma.kader.update({
      where: { id: kaderId },
      data: { role: role === 'OWNER' ? 'OWNER' : 'KADER' },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  },

  async updateKaderStatus(posyanduId: string, kaderId: string, isActive: boolean) {
    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      const err = new Error('Akun kader tidak ditemukan');
      (err as any).statusCode = 404;
      throw err;
    }

    if (targetKader.role === 'OWNER') {
      const err = new Error('Akun dengan peran Owner tidak dapat dinonaktifkan langsung');
      (err as any).statusCode = 400;
      throw err;
    }

    return prisma.kader.update({
      where: { id: kaderId },
      data: { isActive: Boolean(isActive) },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  },

  async deleteKader(posyanduId: string, kaderId: string) {
    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      const err = new Error('Akun kader tidak ditemukan');
      (err as any).statusCode = 404;
      throw err;
    }

    if (targetKader.role === 'OWNER') {
      const err = new Error('Akses akun dengan peran Owner tidak dapat dihapus');
      (err as any).statusCode = 400;
      throw err;
    }

    await prisma.kader.delete({ where: { id: kaderId } });
    return targetKader;
  },
};
