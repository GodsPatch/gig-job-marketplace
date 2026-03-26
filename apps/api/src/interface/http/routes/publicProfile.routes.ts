import { Router } from 'express';
import { PublicProfileController } from '../controllers/PublicProfileController';

const router = Router();

router.get('/:id/profile', PublicProfileController.getProfile);

export const publicProfileRoutes = router;
