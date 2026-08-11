import { Router } from 'express';
import { getDashboardSummary } from './dashboard.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// GET /api/dashboard/:posyanduId
router.get('/:posyanduId', authenticate, getDashboardSummary);

export default router;
