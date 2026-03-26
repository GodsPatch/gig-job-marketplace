import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { searchLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/', searchLimiter, CategoryController.list);
router.get('/:slug', searchLimiter, CategoryController.getBySlug);

export const categoryRoutes = router;
