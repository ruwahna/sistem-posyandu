import { Router } from 'express';
import { getNotifications, markNotificationsAsRead } from './notification.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read', markNotificationsAsRead);

export default router;
