import { Router } from 'express';
import { createTask, getTasks } from '../controllers/taskController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protected routes
router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);

export default router;

