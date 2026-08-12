import { Router } from 'express';
import { getDashboardSummary, getTrenGizi, getDistribusiKehadiran } from './dashboard.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// GET /api/dashboard/:posyanduId
router.get('/:posyanduId', authenticate, getDashboardSummary);
// GET /api/dashboard/:posyanduId/tren-gizi
router.get('/:posyanduId/tren-gizi', authenticate, getTrenGizi);
// GET /api/dashboard/:posyanduId/distribusi-kehadiran (Poin 20)
router.get('/:posyanduId/distribusi-kehadiran', authenticate, getDistribusiKehadiran);

export default router;
