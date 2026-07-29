import { Router } from 'express';
import {
  getAllBalita,
  getBalitaById,
  createBalita,
  updateBalita,
  deleteBalita,
  getAllPemeriksaanBalita,
  createPemeriksaanBalita,
  updatePemeriksaanBalita,
  deletePemeriksaanBalita,
} from '../controllers/balita.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createBalitaSchema,
  updateBalitaSchema,
  createPemeriksaanBalitaSchema,
  updatePemeriksaanBalitaSchema,
} from '../lib/schemas';

// mergeParams: true agar bisa akses :posyanduId dari parent router
const router = Router({ mergeParams: true });

// ── BALITA ─────────────────────────────────────────────────
router.get('/', authenticate, getAllBalita);
router.get('/:id', authenticate, getBalitaById);
router.post('/', authenticate, validate(createBalitaSchema), createBalita);
router.patch('/:id', authenticate, validate(updateBalitaSchema), updateBalita);
router.delete('/:id', authenticate, authorize('OWNER'), deleteBalita);

// ── PEMERIKSAAN BALITA ─────────────────────────────────────
router.get('/:balitaId/pemeriksaan', authenticate, getAllPemeriksaanBalita);
router.post('/:balitaId/pemeriksaan', authenticate, validate(createPemeriksaanBalitaSchema), createPemeriksaanBalita);
router.patch('/:balitaId/pemeriksaan/:id', authenticate, validate(updatePemeriksaanBalitaSchema), updatePemeriksaanBalita);
router.delete('/:balitaId/pemeriksaan/:id', authenticate, authorize('OWNER'), deletePemeriksaanBalita);

export default router;
