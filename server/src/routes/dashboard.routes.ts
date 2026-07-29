import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// GET /api/dashboard/:posyanduId
router.get('/:posyanduId', authenticate, getDashboardSummary);

export default router;
