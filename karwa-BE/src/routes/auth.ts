import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authenticate, getCurrentUser);

export default router;
