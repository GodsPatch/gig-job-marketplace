import { Request, Response } from 'express';
import { GetProgressUseCase } from '../../../application/use-cases/gamification/GetProgressUseCase';
import { GetPointHistoryUseCase } from '../../../application/use-cases/gamification/GetPointHistoryUseCase';
import { GetLeaderboardUseCase } from '../../../application/use-cases/gamification/GetLeaderboardUseCase';
import { ListAchievementsUseCase } from '../../../application/use-cases/gamification/ListAchievementsUseCase';

export class GamificationController {
  constructor(
    private getProgressUseCase: GetProgressUseCase,
    private getPointHistoryUseCase: GetPointHistoryUseCase,
    private getLeaderboardUseCase: GetLeaderboardUseCase,
    private listAchievementsUseCase: ListAchievementsUseCase
  ) {}

  getProgress = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const progress = await this.getProgressUseCase.execute(userId);
    res.json({ success: true, data: progress });
  };

  getPointHistory = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    
    const result = await this.getPointHistoryUseCase.execute(userId, page, limit);
    res.json({ success: true, data: { transactions: result.items, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } } });
  };

  getLeaderboard = async (req: Request, res: Response) => {
    const cycle = req.query.cycle as 'weekly' | 'monthly';
    const userId = req.user?.userId; // from optionalAuth

    const result = await this.getLeaderboardUseCase.execute(cycle, userId);
    res.json({ success: true, data: result });
  };

  getAchievements = async (_req: Request, res: Response) => {
    const achievements = await this.listAchievementsUseCase.execute();
    res.json({ success: true, data: { achievements } });
  };
}
