import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { optionalAuth } from '../middlewares/optionalAuth';
import { validate } from '../middlewares/validate';
import { createJobSchema, updateJobSchema, jobListQuerySchema, publicSearchSchema } from '../validators/job.validators';
import { jobCreationLimiter, searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Create Job (Employer/Admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('employer', 'admin'),
  jobCreationLimiter,
  validate({ body: createJobSchema }),
  JobController.create
);

// List Owner Jobs
router.get(
  '/me',
  authMiddleware,
  validate({ query: jobListQuerySchema }),
  JobController.listOwn
);

// Public Search Jobs (MUST BE BEFORE /:slug)
router.get(
  '/public',
  searchLimiter,
  validate({ query: publicSearchSchema }),
  JobController.searchPublic
);

// Get Job Detail by Slug
router.get(
  '/:slug',
  optionalAuth,
  JobController.getBySlug
);

// Edit Draft Job
router.patch(
  '/:id',
  authMiddleware,
  validate({ body: updateJobSchema }),
  JobController.update
);

// Publish Job
router.post(
  '/:id/publish',
  authMiddleware,
  JobController.publish
);

// Close Job
router.post(
  '/:id/close',
  authMiddleware,
  JobController.close
);

export const jobRoutes = router;
