import { Router } from 'express';
import { getNotifications, markNotificationsAsRead, deleteNotification } from './notification.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read', markNotificationsAsRead);
router.delete('/:id', deleteNotification);

export default router;
