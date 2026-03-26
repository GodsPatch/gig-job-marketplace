import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { GetProfileUseCase } from '../../../application/use-cases/auth/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../../application/use-cases/auth/UpdateProfileUseCase';
import { PostgresUserRepository } from '../../../infrastructure/repositories/PostgresUserRepository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { updateProfileSchema } from '../validators/user.validators';

const router = Router();

// --- Dependency Injection ---
const userRepository = new PostgresUserRepository();
const getProfileUseCase = new GetProfileUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const userController = new UserController(getProfileUseCase, updateProfileUseCase);

/**
 * Helper to wrap async controller methods.
 */
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// GET /api/v1/users/me
router.get(
  '/users/me',
  authMiddleware,
  asyncHandler((req, res) => userController.getProfile(req, res)),
);

// PATCH /api/v1/users/me
router.patch(
  '/users/me',
  authMiddleware,
  validate({ body: updateProfileSchema }),
  asyncHandler((req, res) => userController.updateProfile(req, res)),
);

export default router;
