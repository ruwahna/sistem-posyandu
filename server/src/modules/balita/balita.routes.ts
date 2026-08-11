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
} from './balita.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  createBalitaSchema,
  updateBalitaSchema,
  createPemeriksaanBalitaSchema,
  updatePemeriksaanBalitaSchema,
} from './balita.schema';

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
