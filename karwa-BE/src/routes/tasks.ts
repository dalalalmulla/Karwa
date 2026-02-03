import { Router } from 'express';
import { createTask, getTasks, getTaskById } from '../controllers/taskController';
import { getTaskApplications } from '../controllers/applicationController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protected routes
router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
// More specific route must come before generic :taskId route
router.get('/:taskId/applications', authenticate, getTaskApplications);
router.get('/:taskId', authenticate, getTaskById);

export default router;

