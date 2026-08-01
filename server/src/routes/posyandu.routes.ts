import { Router } from 'express';
import {
  getAllPosyandu,
  getPosyanduById,
  createPosyandu,
  updatePosyandu,
  deletePosyandu,
} from '../controllers/posyandu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPosyanduSchema, updatePosyanduSchema } from '../lib/schemas';

const router = Router();

import { getRiwayat, exportRiwayatExcel } from '../controllers/riwayat.controller';

// GET /api/posyandu/:posyanduId/riwayat  — Riwayat pemeriksaan bulanan
router.get('/:posyanduId/riwayat', authenticate, getRiwayat);

// GET /api/posyandu/:posyanduId/export   — Export Excel laporan riwayat
router.get('/:posyanduId/export', authenticate, exportRiwayatExcel);

// GET /api/posyandu  — siapa saja yang sudah login bisa lihat daftar posyandu
router.get('/', authenticate, getAllPosyandu);

// GET /api/posyandu/:id
router.get('/:id', authenticate, getPosyanduById);

// POST /api/posyandu  — hanya OWNER
router.post('/', authenticate, authorize('OWNER'), validate(createPosyanduSchema), createPosyandu);

// PATCH /api/posyandu/:id  — hanya OWNER
router.patch('/:id', authenticate, authorize('OWNER'), validate(updatePosyanduSchema), updatePosyandu);

// DELETE /api/posyandu/:id  — hanya OWNER
router.delete('/:id', authenticate, authorize('OWNER'), deletePosyandu);

export default router;
