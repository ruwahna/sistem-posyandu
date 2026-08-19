import { Router } from 'express';
import { getPosyanduListController, getPemeriksaanPuskesmasController } from './public.controller';

const router = Router();

// GET /api/public/posyandu - Public list of Posyandu locations
router.get('/posyandu', getPosyanduListController);

// GET /api/public/puskesmas/pemeriksaan - Public sanitized examination records for Puskesmas officers
router.get('/puskesmas/pemeriksaan', getPemeriksaanPuskesmasController);

export default router;
