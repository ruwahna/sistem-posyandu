import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { sendResetPasswordEmail } from '../lib/email';

/**
 * POST /api/auth/register
 * Mendaftarkan kader baru ke sebuah posyandu.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, email, password, posyanduId } = req.body;

    // Cek email sudah ada
    const existing = await prisma.kader.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    // Cek posyandu ada
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Kader pertama di posyandu jadi OWNER
    const kaderCount = await prisma.kader.count({ where: { posyanduId } });
    const role = kaderCount === 0 ? 'OWNER' : 'KADER';

    const kader = await prisma.kader.create({
      data: { id: uuidv4(), nama, email, password: hashedPassword, posyanduId, role: role as 'OWNER' | 'KADER' },
      select: { id: true, nama: true, email: true, role: true, posyanduId: true },
    });

    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: kader });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/auth/register-posyandu
 * Registrasi publik: membuat Posyandu baru + Kader OWNER pertama sekaligus.
 */
export const registerPosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // Posyandu fields
      namaPosyandu, desa, kecamatan, alamat,
      // Kader fields
      namaKader, email, password,
    } = req.body;

    // Validasi wajib
    if (!namaPosyandu || !desa || !kecamatan || !alamat || !namaKader || !email || !password) {
      res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
      return;
    }

    // Cek email sudah dipakai
    const existingKader = await prisma.kader.findUnique({ where: { email } });
    if (existingKader) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat Posyandu + Owner dalam satu transaksi
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

    // Auto-login: buat token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    const token = jwt.sign(
      { userId: result.kader.id, posyanduId: result.posyandu.id, role: 'OWNER' },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      success: true,
      message: 'Posyandu dan akun berhasil dibuat',
      data: {
        token,
        kader: {
          ...result.kader,
          posyandu: { id: result.posyandu.id, nama: result.posyandu.nama },
        },
      },
    });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const kader = await prisma.kader.findUnique({
      where: { email },
      include: { posyandu: { select: { id: true, nama: true } } },
    });

    if (!kader || !(await bcrypt.compare(password, kader.password))) {
      res.status(401).json({ success: false, message: 'Email atau password salah' });
      return;
    }

    if (!kader.isActive) {
      res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    const token = jwt.sign(
      { userId: kader.id, posyanduId: kader.posyanduId, role: kader.role },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        kader: {
          id: kader.id,
          nama: kader.nama,
          email: kader.email,
          role: kader.role,
          posyandu: kader.posyandu,
        },
      },
    });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/auth/me
 * Mengembalikan data kader yang sedang login.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const kader = await prisma.kader.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, nama: true, email: true, role: true, isActive: true,
        posyandu: { select: { id: true, nama: true, desa: true, kecamatan: true } },
      },
    });

    if (!kader) {
      res.status(404).json({ success: false, message: 'Kader tidak ditemukan' });
      return;
    }

    res.json({ success: true, data: kader });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/auth/forgot-password
 * Mengirim email instruksi reset password.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const kader = await prisma.kader.findUnique({ where: { email } });
    if (!kader) {
      // Keamanan: hindari email enumeration attack
      res.json({
        success: true,
        message: 'Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.',
      });
      return;
    }

    if (!kader.isActive) {
      res.status(403).json({ success: false, message: 'Akun Anda dinonaktifkan.' });
      return;
    }

    // Generate random token & expiry (1 jam)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.kader.update({
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

    res.json({
      success: true,
      message: 'Instruksi reset password telah dikirim ke email Anda.',
    });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/auth/verify-reset-token/:token
 * Memeriksa apakah token reset password valid.
 */
export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const kader = await prisma.kader.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!kader) {
      res.status(400).json({
        success: false,
        valid: false,
        message: 'Tautan reset password tidak valid atau telah kadaluarsa.',
      });
      return;
    }

    res.json({ success: true, valid: true });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/auth/reset-password
 * Mengubah kata sandi pengguna dengan token reset password.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.body.token);
    const { newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const kader = await prisma.kader.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!kader) {
      res.status(400).json({
        success: false,
        message: 'Tautan reset password tidak valid atau telah kadaluarsa.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.kader.update({
      where: { id: kader.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (err) {
    throw err;
  }
};

