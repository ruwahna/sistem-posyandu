import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../../shared/config/prisma';
import { sendResetPasswordEmail } from '../../shared/config/email';

export const authService = {
  async register(data: { nama: string; email: string; password: string; posyanduId: string }) {
    const { nama, email, password, posyanduId } = data;

    const existing = await prisma.kader.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('Email sudah terdaftar');
      (err as any).statusCode = 409;
      throw err;
    }

    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      const err = new Error('Posyandu tidak ditemukan');
      (err as any).statusCode = 404;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const kaderCount = await prisma.kader.count({ where: { posyanduId } });
    const role = kaderCount === 0 ? 'OWNER' : 'KADER';

    return prisma.kader.create({
      data: { id: uuidv4(), nama, email, password: hashedPassword, posyanduId, role: role as 'OWNER' | 'KADER' },
      select: { id: true, nama: true, email: true, role: true, posyanduId: true },
    });
  },

  async registerPosyandu(data: {
    namaPosyandu: string;
    desa: string;
    kecamatan: string;
    alamat: string;
    namaKader: string;
    email: string;
    password: string;
  }) {
    const { namaPosyandu, desa, kecamatan, alamat, namaKader, email, password } = data;

    if (!namaPosyandu || !desa || !kecamatan || !alamat || !namaKader || !email || !password) {
      const err = new Error('Semua field wajib diisi');
      (err as any).statusCode = 400;
      throw err;
    }

    if (password.length < 8) {
      const err = new Error('Password minimal 8 karakter');
      (err as any).statusCode = 400;
      throw err;
    }

    const existingKader = await prisma.kader.findUnique({ where: { email } });
    if (existingKader) {
      const err = new Error('Email sudah terdaftar');
      (err as any).statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const posyandu = await tx.posyandu.create({
        data: { nama: namaPosyandu, desa, kecamatan, alamat },
      });

      const kader = await tx.kader.create({
        data: {
          id: uuidv4(),
          nama: namaKader,
          email,
          password: hashedPassword,
          posyanduId: posyandu.id,
          role: 'OWNER',
        },
        select: { id: true, nama: true, email: true, role: true },
      });

      return { posyandu, kader };
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    const token = jwt.sign(
      { userId: result.kader.id, posyanduId: result.posyandu.id, role: 'OWNER' },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return {
      token,
      kader: {
        ...result.kader,
        posyandu: { id: result.posyandu.id, nama: result.posyandu.nama },
      },
    };
  },

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const kader = await prisma.kader.findUnique({
      where: { email },
      include: { posyandu: { select: { id: true, nama: true } } },
    });

    if (!kader || !(await bcrypt.compare(password, kader.password))) {
      const err = new Error('Email atau password salah');
      (err as any).statusCode = 401;
      throw err;
    }

    if (!kader.isActive) {
      const err = new Error('Akun Anda telah dinonaktifkan');
      (err as any).statusCode = 403;
      throw err;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    const token = jwt.sign(
      { userId: kader.id, posyanduId: kader.posyanduId, role: kader.role },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return {
      token,
      kader: {
        id: kader.id,
        nama: kader.nama,
        email: kader.email,
        role: kader.role,
        posyandu: kader.posyandu,
      },
    };
  },

  async getMe(userId: string) {
    const kader = await prisma.kader.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        posyandu: { select: { id: true, nama: true, desa: true, kecamatan: true } },
      },
    });

    if (!kader) {
      const err = new Error('Kader tidak ditemukan');
      (err as any).statusCode = 404;
      throw err;
    }

    return kader;
  },

  async updateProfile(userId: string, data: { nama: string; email: string; password?: string }) {
    const { nama, email, password } = data;

    if (!nama || !email) {
      const err = new Error('Nama dan email wajib diisi');
      (err as any).statusCode = 400;
      throw err;
    }

    const existing = await prisma.kader.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existing) {
      const err = new Error('Email sudah digunakan oleh pengguna lain');
      (err as any).statusCode = 409;
      throw err;
    }

    const updateData: any = { nama, email };
    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
    }

    return prisma.kader.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        posyandu: { select: { id: true, nama: true } },
      },
    });
  },

  async forgotPassword(email: string) {
    const kader = await prisma.kader.findUnique({ where: { email } });
    if (!kader) {
      return { message: 'Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.' };
    }

    if (!kader.isActive) {
      const err = new Error('Akun Anda dinonaktifkan.');
      (err as any).statusCode = 403;
      throw err;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await (prisma.kader as any).update({
      where: { id: kader.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    const clientHost = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0].trim() : 'http://localhost:3000';
    const resetUrl = `${clientHost}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail({
      to: kader.email,
      nama: kader.nama,
      resetUrl,
    });

    return { message: 'Instruksi reset password telah dikirim ke email Anda.' };
  },

  async verifyResetToken(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const kader = await (prisma.kader as any).findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!kader) {
      return { valid: false, message: 'Tautan reset password tidak valid atau telah kadaluarsa.' };
    }

    return { valid: true };
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const kader = await (prisma.kader as any).findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!kader) {
      const err = new Error('Tautan reset password tidak valid atau telah kadaluarsa.');
      (err as any).statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await (prisma.kader as any).update({
      where: { id: kader.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.' };
  },
};
