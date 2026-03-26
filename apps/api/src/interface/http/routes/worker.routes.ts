import { Router } from 'express';
import { WorkerController } from '../controllers/WorkerController';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { updateWorkerProfileSchema, updateWorkerSkillsSchema, workerListQuerySchema } from '../validators/worker.validators';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public: Search workers
router.get('/', searchLimiter, validate({ query: workerListQuerySchema }), WorkerController.search);

// Authenticated worker: Get my profile
router.get('/me/profile', authMiddleware, requireRole('worker'), WorkerController.getMyProfile);

// Authenticated worker: Update my profile
router.patch('/me/profile', authMiddleware, requireRole('worker'), validate({ body: updateWorkerProfileSchema }), WorkerController.updateMyProfile);

// Authenticated worker: Set my skills
router.put('/me/skills', authMiddleware, requireRole('worker'), validate({ body: updateWorkerSkillsSchema }), WorkerController.updateMySkills);

export const workerRoutes = router;
