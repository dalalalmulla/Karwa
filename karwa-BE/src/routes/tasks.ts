import { Router } from 'express';
import { createTask, getTasks } from '../controllers/taskController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protected routes
router.post('/', authenticate, createTask);
router.get('/', getTasks); // Public route to view marketplace

export default router;
