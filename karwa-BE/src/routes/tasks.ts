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

const router = Router();

// Protected routes
router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/:id/apply', authenticate, applyToTask);
router.patch('/:id/assign', authenticate, assignWorker);
router.patch('/:id/mark-complete', authenticate, markCompleteByWorker);
router.patch('/:id/complete', authenticate, confirmCompletion);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.post('/:id/rate', authenticate, submitRating);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;

