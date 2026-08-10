import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

/**
 * Helper to generate invitation code for a Posyandu
 */
function generateInvitationCode(namaPosyandu: string): string {
  const cleanName = namaPosyandu
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 10) || 'POSYANDU';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}-KADER-${randomSuffix}`;
}

/**
 * GET /api/posyandu/:posyanduId/kader
 * Mengambil daftar seluruh kader di posyandu ini.
 */
export const getKadersByPosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);

    // Pastikan user memiliki akses ke posyandu ini
    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data posyandu ini' });
      return;
    }

    const kaders = await prisma.kader.findMany({
      where: { posyanduId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: kaders });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/kader
 * Membuat akun kader baru langsung oleh Owner posyandu.
 */
export const createKader = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);
    const { nama, email, password, role } = req.body;

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat menambah akun baru' });
      return;
    }

    // Cek email sudah digunakan
    const existing = await prisma.kader.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar sebagai akun kader di sistem' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newKader = await prisma.kader.create({
      data: {
        id: uuidv4(),
        nama,
        email,
        password: hashedPassword,
        posyanduId,
        role: role === 'OWNER' ? 'OWNER' : 'KADER',
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Akun kader ${nama} berhasil dibuat`,
      data: newKader,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/kader/:id/role
 * Mengubah peran kader (OWNER <-> KADER).
 */
export const updateKaderRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);
    const kaderId = String(req.params.id);
    const { role } = req.body;

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat mengubah peran akun' });
      return;
    }

    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      res.status(404).json({ success: false, message: 'Akun kader tidak ditemukan di posyandu ini' });
      return;
    }

    // Tidak boleh merubah peran diri sendiri jika ia satu-satunya owner
    if (targetKader.id === req.user.userId && role !== 'OWNER') {
      const ownerCount = await prisma.kader.count({
        where: { posyanduId, role: 'OWNER', isActive: true },
      });
      if (ownerCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Posyandu harus memiliki minimal 1 Kader Owner aktif.',
        });
        return;
      }
    }

    const updated = await prisma.kader.update({
      where: { id: kaderId },
      data: { role: role === 'OWNER' ? 'OWNER' : 'KADER' },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `Peran kader ${updated.nama} berhasil diubah menjadi ${updated.role}`,
      data: updated,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/kader/:id/status
 * Mengubah status keaktifan kader (isActive: true/false).
 */
export const updateKaderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);
    const kaderId = String(req.params.id);
    const { isActive } = req.body;

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat mengubah status akun' });
      return;
    }

    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      res.status(404).json({ success: false, message: 'Akun kader tidak ditemukan' });
      return;
    }

    if (targetKader.role === 'OWNER') {
      res.status(400).json({
        success: false,
        message: 'Akun dengan peran Owner tidak dapat dinonaktifkan langsung',
      });
      return;
    }

    const updated = await prisma.kader.update({
      where: { id: kaderId },
      data: { isActive: Boolean(isActive) },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `Status kader ${updated.nama} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`,
      data: updated,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:posyanduId/kader/:id
 * Menghapus/mencabut akses kader dari posyandu.
 */
export const deleteKader = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);
    const kaderId = String(req.params.id);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat menghapus akses kader' });
      return;
    }

    const targetKader = await prisma.kader.findFirst({
      where: { id: kaderId, posyanduId },
    });

    if (!targetKader) {
      res.status(404).json({ success: false, message: 'Akun kader tidak ditemukan' });
      return;
    }

    if (targetKader.role === 'OWNER') {
      res.status(400).json({
        success: false,
        message: 'Akses akun dengan peran Owner tidak dapat dihapus',
      });
      return;
    }

    await prisma.kader.delete({ where: { id: kaderId } });

    res.json({
      success: true,
      message: `Akses kader ${targetKader.nama} telah dicabut dari posyandu`,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:posyanduId/invite-code
 * Mendapatkan kode undangan posyandu.
 */
export const getInviteCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    let posyandu = await prisma.posyandu.findUnique({
      where: { id: posyanduId },
      select: { id: true, nama: true, kodeUndangan: true },
    });

    if (!posyandu) {
      res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan' });
      return;
    }

    // Jika belum ada kode undangan, buat secara otomatis
    if (!posyandu.kodeUndangan) {
      const code = generateInvitationCode(posyandu.nama);
      posyandu = await prisma.posyandu.update({
        where: { id: posyanduId },
        data: { kodeUndangan: code },
        select: { id: true, nama: true, kodeUndangan: true },
      });
    }

    res.json({
      success: true,
      data: { invitationCode: posyandu.kodeUndangan },
    });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/invite-code/regen
 * Memperbarui / meriset kode undangan posyandu baru.
 */
export const regenerateInviteCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat memperbarui kode undangan' });
      return;
    }

    const posyandu = await prisma.posyandu.findUnique({
      where: { id: posyanduId },
    });

    if (!posyandu) {
      res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan' });
      return;
    }

    const newCode = generateInvitationCode(posyandu.nama);

    const updated = await prisma.posyandu.update({
      where: { id: posyanduId },
      data: { kodeUndangan: newCode },
      select: { id: true, kodeUndangan: true },
    });

    res.json({
      success: true,
      message: 'Kode undangan berhasil diperbarui',
      data: { invitationCode: updated.kodeUndangan },
    });
  } catch (err) {
    throw err;
  }
};
