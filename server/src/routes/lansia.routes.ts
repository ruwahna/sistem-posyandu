import { Router } from 'express';
import {
  getAllLansia,
  getLansiaById,
  createLansia,
  updateLansia,
  deleteLansia,
  getAllPemeriksaanLansia,
  createPemeriksaanLansia,
  updatePemeriksaanLansia,
  deletePemeriksaanLansia,
} from '../controllers/lansia.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createLansiaSchema,
  updateLansiaSchema,
  createPemeriksaanLansiaSchema,
  updatePemeriksaanLansiaSchema,
} from '../lib/schemas';

const router = Router({ mergeParams: true });

// ── LANSIA ─────────────────────────────────────────────────
router.get('/', authenticate, getAllLansia);
router.get('/:id', authenticate, getLansiaById);
router.post('/', authenticate, validate(createLansiaSchema), createLansia);
router.patch('/:id', authenticate, validate(updateLansiaSchema), updateLansia);
router.delete('/:id', authenticate, authorize('OWNER'), deleteLansia);

// ── PEMERIKSAAN LANSIA ─────────────────────────────────────
router.get('/:lansiaId/pemeriksaan', authenticate, getAllPemeriksaanLansia);
router.post('/:lansiaId/pemeriksaan', authenticate, validate(createPemeriksaanLansiaSchema), createPemeriksaanLansia);
router.patch('/:lansiaId/pemeriksaan/:id', authenticate, validate(updatePemeriksaanLansiaSchema), updatePemeriksaanLansia);
router.delete('/:lansiaId/pemeriksaan/:id', authenticate, authorize('OWNER'), deletePemeriksaanLansia);

export default router;
