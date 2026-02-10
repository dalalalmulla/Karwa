import { Router } from 'express';
import {
    createTask,
    getTasks,
    getTaskById,
    applyToTask,
    assignWorker,
    markCompleteByWorker,
    confirmCompletion,
    submitRating,
    updateTaskStatus,
    updateTask,
    deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/authenticate';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate';

const router = Router();

// Public routes (optional authentication - can view without login)
router.get('/', optionalAuthenticate, getTasks);
router.get('/:id', optionalAuthenticate, getTaskById);

// Protected routes (require authentication)
router.post('/', authenticate, createTask);
router.post('/:id/apply', authenticate, applyToTask);
router.patch('/:id/assign', authenticate, assignWorker);
router.patch('/:id/mark-complete', authenticate, markCompleteByWorker);
router.patch('/:id/complete', authenticate, confirmCompletion);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.post('/:id/rate', authenticate, submitRating);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;

