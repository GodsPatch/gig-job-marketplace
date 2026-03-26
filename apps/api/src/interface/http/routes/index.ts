import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

/**
 * Route aggregator — mounts all route modules.
 * All routes are prefixed with /api/v1/ in app.ts.
 *
 * To add new route modules:
 * 1. Create a new file in routes/ (e.g., jobs.routes.ts)
 * 2. Import and mount it here
 */
router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);

import { jobRoutes } from './job.routes';
import { categoryRoutes } from './category.routes';
import { workerRoutes } from './worker.routes';
import { skillRoutes } from './skill.routes';
import { reviewRoutes } from './review.routes';
import { publicProfileRoutes } from './publicProfile.routes';
import { gamificationRoutes } from './gamification.routes';

// M3+ routes
router.use('/jobs', jobRoutes);
router.use('/categories', categoryRoutes);

// M5 routes
router.use('/workers', workerRoutes);
router.use('/skills', skillRoutes);
router.use('/', reviewRoutes); // reviews are nested under /jobs/:jobId/reviews and /users/:userId/reviews
router.use('/users', publicProfileRoutes);

// M6 Gamification
router.use('/gamification', gamificationRoutes);

export default router;
