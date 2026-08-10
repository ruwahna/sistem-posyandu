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

import { getRiwayat, exportRiwayatExcel, exportRiwayatPdf } from '../controllers/riwayat.controller';
import {
  getKadersByPosyandu,
  createKader,
  updateKaderRole,
  updateKaderStatus,
  deleteKader,
} from '../controllers/kader.controller';
import {
  createKaderSchema,
  updateKaderRoleSchema,
  updateKaderStatusSchema,
} from '../lib/schemas';

// GET /api/posyandu/:posyanduId/riwayat  — Riwayat pemeriksaan bulanan
router.get('/:posyanduId/riwayat', authenticate, getRiwayat);

// GET /api/posyandu/:posyanduId/export   — Export Excel laporan riwayat
router.get('/:posyanduId/export', authenticate, exportRiwayatExcel);

// GET /api/posyandu/:posyanduId/export-pdf — Export PDF laporan riwayat
router.get('/:posyanduId/export-pdf', authenticate, exportRiwayatPdf);

// ── MANAJEMEN AKUN KADER ──
// GET /api/posyandu/:posyanduId/kader
router.get('/:posyanduId/kader', authenticate, getKadersByPosyandu);

// POST /api/posyandu/:posyanduId/kader
router.post('/:posyanduId/kader', authenticate, authorize('OWNER'), validate(createKaderSchema), createKader);

// PATCH /api/posyandu/:posyanduId/kader/:id/role
router.patch('/:posyanduId/kader/:id/role', authenticate, authorize('OWNER'), validate(updateKaderRoleSchema), updateKaderRole);

// PATCH /api/posyandu/:posyanduId/kader/:id/status
router.patch('/:posyanduId/kader/:id/status', authenticate, authorize('OWNER'), validate(updateKaderStatusSchema), updateKaderStatus);

// DELETE /api/posyandu/:posyanduId/kader/:id
router.delete('/:posyanduId/kader/:id', authenticate, authorize('OWNER'), deleteKader);

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
