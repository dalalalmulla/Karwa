import { Router } from 'express';
import {
    applyToTask,
    getTaskApplications,
    getMyApplications,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protected routes - all require authentication
router.post('/', authenticate, applyToTask);
router.get('/me', authenticate, getMyApplications);

export default router;

