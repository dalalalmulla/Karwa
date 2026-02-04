import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get all notifications for current user
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllNotificationsRead);

// PUT /api/notifications/:id/read - Mark a single notification as read
router.put('/:id/read', markNotificationRead);

export default router;
