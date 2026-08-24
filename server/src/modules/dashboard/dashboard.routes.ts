import { Router } from 'express';
import { getDashboardSummary, getTrenGizi, getDistribusiKehadiran, getAktivitasKunjungan } from './dashboard.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// GET /api/dashboard/:posyanduId
router.get('/:posyanduId', authenticate, getDashboardSummary);
// GET /api/dashboard/:posyanduId/tren-gizi
router.get('/:posyanduId/tren-gizi', authenticate, getTrenGizi);
// GET /api/dashboard/:posyanduId/distribusi-kehadiran (Poin 20)
router.get('/:posyanduId/distribusi-kehadiran', authenticate, getDistribusiKehadiran);
// GET /api/dashboard/:posyanduId/aktivitas-kunjungan
router.get('/:posyanduId/aktivitas-kunjungan', authenticate, getAktivitasKunjungan);

export default router;
