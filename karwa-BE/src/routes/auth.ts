import { Router } from 'express';
import { register, login, getCurrentUser, updateUserRole } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch('/role', authenticate, updateUserRole);

export default router;
