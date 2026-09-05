import { Router } from 'express';
import {
  getPeriodeList,
  getActivePeriode,
  createPeriode,
  updatePeriode,
  activatePeriode,
  deletePeriode,
} from './periode.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createPeriodeSchema, updatePeriodeSchema } from './periode.schema';

const router = Router({ mergeParams: true });

router.get('/', authenticate, getPeriodeList);
router.get('/active', authenticate, getActivePeriode);
router.post('/', authenticate, validate(createPeriodeSchema), createPeriode);
router.patch('/:id', authenticate, validate(updatePeriodeSchema), updatePeriode);
router.post('/:id/activate', authenticate, activatePeriode);
router.delete('/:id', authenticate, deletePeriode);

export default router;
