import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { PostgresUserRepository } from '../../../infrastructure/repositories/PostgresUserRepository';
import { PostgresRefreshTokenRepository } from '../../../infrastructure/repositories/PostgresRefreshTokenRepository';
import { BcryptPasswordService } from '../../../infrastructure/services/BcryptPasswordService';
import { JwtTokenService } from '../../../infrastructure/services/JwtTokenService';
import { GamificationServiceImpl } from '../../../infrastructure/services/GamificationServiceImpl';
import { PostgresPointRepository } from '../../../infrastructure/repositories/PostgresPointRepository';
import { PostgresAchievementRepository } from '../../../infrastructure/repositories/PostgresAchievementRepository';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middlewares/rateLimiter';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// --- Dependency Injection (Poor Man's DI) ---
const userRepository = new PostgresUserRepository();
const refreshTokenRepository = new PostgresRefreshTokenRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();
const pointRepo = new PostgresPointRepository();
const achievementRepo = new PostgresAchievementRepository();
const gamificationService = new GamificationServiceImpl(pointRepo, achievementRepo);

const registerUseCase = new RegisterUseCase(userRepository, refreshTokenRepository, passwordService, tokenService, gamificationService);
const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, passwordService, tokenService, gamificationService, pointRepo);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService);
const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenService);

const authController = new AuthController(registerUseCase, loginUseCase, refreshTokenUseCase, logoutUseCase);

/**
 * Helper to wrap async controller methods.
 * Catches errors and forwards them to Express error handler.
 */
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// POST /api/v1/auth/register
router.post(
  '/auth/register',
  registerLimiter,
  validate({ body: registerSchema }),
  asyncHandler((req, res) => authController.register(req, res)),
);

// POST /api/v1/auth/login
router.post(
  '/auth/login',
  loginLimiter,
  validate({ body: loginSchema }),
  asyncHandler((req, res) => authController.login(req, res)),
);

// POST /api/v1/auth/refresh
router.post(
  '/auth/refresh',
  refreshLimiter,
  asyncHandler((req, res) => authController.refresh(req, res)),
);

// POST /api/v1/auth/logout
router.post(
  '/auth/logout',
  authMiddleware,
  asyncHandler((req, res) => authController.logout(req, res)),
);

export default router;
