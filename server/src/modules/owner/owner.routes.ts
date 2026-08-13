import { Router } from 'express';
import { exportBackupData, getAuditLogs, resetPosyanduData } from './owner.controller';
import { authenticate, authorizeRole } from '../../shared/middlewares/auth.middleware';

const router = Router();

// GET /api/owner/backup/:posyanduId
router.get('/backup/:posyanduId', authenticate, exportBackupData);

// GET /api/owner/audit-logs/:posyanduId
router.get('/audit-logs/:posyanduId', authenticate, getAuditLogs);

// POST /api/owner/reset-data/:posyanduId
router.post('/reset-data/:posyanduId', authenticate, authorizeRole('OWNER'), resetPosyanduData);

export default router;
