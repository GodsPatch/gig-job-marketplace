import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createReviewSchema, reviewListQuerySchema } from '../validators/review.validators';
import { reviewCreationLimiter, searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Create review for a job (authenticated)
router.post('/jobs/:jobId/reviews', authMiddleware, reviewCreationLimiter, validate({ body: createReviewSchema }), ReviewController.create);

// List reviews for a job (public)
router.get('/jobs/:jobId/reviews', searchLimiter, ReviewController.listByJob);

// List reviews received by a user (public)
router.get('/users/:userId/reviews', searchLimiter, validate({ query: reviewListQuerySchema }), ReviewController.listByUser);

export const reviewRoutes = router;
