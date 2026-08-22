import { Request, Response, NextFunction } from 'express';
import { kaderService } from './kader.service';

export const getKadersByPosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data posyandu ini' });
      return;
    }

    const kaders = await kaderService.getKadersByPosyandu(posyanduId);
    res.json({ success: true, data: kaders });
  } catch (err) {
    next(err);
  }
};

export const createKader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat menambah akun baru' });
      return;
    }

    const newKader = await kaderService.createKader(posyanduId, req.body);
    res.status(201).json({
      success: true,
      message: `Akun kader ${newKader.nama} berhasil dibuat`,
      data: newKader,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const updateKaderRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const updated = await kaderService.updateKaderRole(posyanduId, kaderId, req.user.userId, role);
    res.json({
      success: true,
      message: `Peran kader ${updated.nama} berhasil diubah menjadi ${updated.role}`,
      data: updated,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const updateKaderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const updated = await kaderService.updateKaderStatus(posyanduId, kaderId, isActive);
    res.json({
      success: true,
      message: `Status kader ${updated.nama} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`,
      data: updated,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const updateKader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = String(req.params.posyanduId);
    const kaderId = String(req.params.id);

    if (req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke posyandu ini' });
      return;
    }

    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ success: false, message: 'Hanya Kader Owner yang dapat mengubah data kader' });
      return;
    }

    const updated = await kaderService.updateKader(posyanduId, kaderId, req.user!.userId, req.body);
    res.json({
      success: true,
      message: `Data akun ${updated.nama} berhasil diperbarui`,
      data: updated,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const deleteKader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const targetKader = await kaderService.deleteKader(posyanduId, kaderId);
    res.json({
      success: true,
      message: `Akses kader ${targetKader.nama} telah dicabut dari posyandu`,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};
