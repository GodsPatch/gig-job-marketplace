import { Router } from 'express';
import { SkillController } from '../controllers/SkillController';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/', searchLimiter, SkillController.list);

export const skillRoutes = router;
