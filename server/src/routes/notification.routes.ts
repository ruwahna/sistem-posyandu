import { Router } from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read', markNotificationsAsRead);

export default router;
