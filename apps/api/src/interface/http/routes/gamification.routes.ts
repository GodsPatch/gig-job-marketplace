import { Router } from 'express';
import { GamificationController } from '../controllers/GamificationController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { optionalAuth } from '../middlewares/optionalAuth';
import { validate } from '../middlewares/validate';
import { getPointHistorySchema, getLeaderboardSchema } from '../validators/gamification.validators';

// Use Cases
import { GetProgressUseCase } from '../../../application/use-cases/gamification/GetProgressUseCase';
import { GetPointHistoryUseCase } from '../../../application/use-cases/gamification/GetPointHistoryUseCase';
import { GetLeaderboardUseCase } from '../../../application/use-cases/gamification/GetLeaderboardUseCase';
import { ListAchievementsUseCase } from '../../../application/use-cases/gamification/ListAchievementsUseCase';

// Repositories
import { PostgresPointRepository } from '../../../infrastructure/repositories/PostgresPointRepository';
import { PostgresAchievementRepository } from '../../../infrastructure/repositories/PostgresAchievementRepository';

import { gamificationLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Repo instances
const pointRepo = new PostgresPointRepository();
const achievementRepo = new PostgresAchievementRepository();

// Use Case instances
const getProgressUseCase = new GetProgressUseCase(pointRepo, achievementRepo);
const getPointHistoryUseCase = new GetPointHistoryUseCase(pointRepo);
const getLeaderboardUseCase = new GetLeaderboardUseCase(pointRepo);
const listAchievementsUseCase = new ListAchievementsUseCase(achievementRepo);

const controller = new GamificationController(
  getProgressUseCase,
  getPointHistoryUseCase,
  getLeaderboardUseCase,
  listAchievementsUseCase
);

// Private Routes
router.get('/me', authMiddleware, gamificationLimiter, controller.getProgress);
router.get('/me/points', authMiddleware, gamificationLimiter, validate(getPointHistorySchema), controller.getPointHistory);

// Public / Semi-Public Routes
router.get('/achievements', gamificationLimiter, controller.getAchievements);
router.get('/leaderboard', optionalAuth, gamificationLimiter, validate(getLeaderboardSchema), controller.getLeaderboard);

export const gamificationRoutes = router;
