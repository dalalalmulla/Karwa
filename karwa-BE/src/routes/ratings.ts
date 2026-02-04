import { Router } from 'express';
import { createOrUpdateRating, getRating } from '../controllers/ratingController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Protected routes - all require authentication
router.post('/', authenticate, createOrUpdateRating);
router.get('/task/:taskId', authenticate, getRating);

export default router;

