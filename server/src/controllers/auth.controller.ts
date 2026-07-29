import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

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
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
