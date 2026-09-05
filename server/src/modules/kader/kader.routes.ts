import { Router } from 'express';
import {
  getKadersByPosyandu,
  createKader,
  updateKaderRole,
  updateKaderStatus,
  updateKader,
  deleteKader,
} from './kader.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  createKaderSchema,
  updateKaderRoleSchema,
  updateKaderStatusSchema,
  updateKaderSchema,
} from './kader.schema';

const router = Router({ mergeParams: true });

// GET /api/posyandu/:posyanduId/kader
router.get('/', authenticate, getKadersByPosyandu);

// POST /api/posyandu/:posyanduId/kader
router.post('/', authenticate, authorize('OWNER'), validate(createKaderSchema), createKader);

// PUT /api/posyandu/:posyanduId/kader/:id
router.put('/:id', authenticate, authorize('OWNER'), validate(updateKaderSchema), updateKader);

// PATCH /api/posyandu/:posyanduId/kader/:id/role
router.patch('/:id/role', authenticate, authorize('OWNER'), validate(updateKaderRoleSchema), updateKaderRole);

// PATCH /api/posyandu/:posyanduId/kader/:id/status
router.patch('/:id/status', authenticate, authorize('OWNER'), validate(updateKaderStatusSchema), updateKaderStatus);

// DELETE /api/posyandu/:posyanduId/kader/:id
router.delete('/:id', authenticate, authorize('OWNER'), deleteKader);

export default router;
