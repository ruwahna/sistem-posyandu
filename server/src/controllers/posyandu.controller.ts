import { Request, Response } from 'express';
import { posyanduService } from '../services';

/**
 * GET /api/posyandu
 * FR-01: Tampilkan daftar semua posyandu
 */
export const getAllPosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await posyanduService.findAll();
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:id
 */
export const getPosyanduById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = await posyanduService.findById(id);
    if (!data) {
      res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan' });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu
 * FR-02: Admin menambah posyandu baru
 */
export const createPosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await posyanduService.create(req.body);
    res.status(201).json({ success: true, message: 'Posyandu berhasil dibuat', data });
  } catch (err) {
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:id
 * FR-03: Admin mengubah data posyandu
 */
export const updatePosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = await posyanduService.update(id, req.body);
    res.json({ success: true, message: 'Posyandu berhasil diperbarui', data });
  } catch (err) {
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:id
 * FR-04: Admin menghapus posyandu (validasi data aktif)
 */
export const deletePosyandu = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await posyanduService.delete(id);
    res.json({ success: true, message: 'Posyandu berhasil dihapus' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak dapat dihapus')) {
      res.status(409).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};
