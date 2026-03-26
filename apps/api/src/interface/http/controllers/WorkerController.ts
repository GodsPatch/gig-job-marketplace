import { Request, Response, NextFunction } from 'express';
import { PostgresWorkerProfileRepository } from '../../../infrastructure/repositories/PostgresWorkerProfileRepository';
import { PostgresSkillRepository } from '../../../infrastructure/repositories/PostgresSkillRepository';
import { GetMyWorkerProfileUseCase } from '../../../application/use-cases/worker-profile/GetMyWorkerProfileUseCase';
import { UpdateWorkerProfileUseCase } from '../../../application/use-cases/worker-profile/UpdateWorkerProfileUseCase';
import { UpdateWorkerSkillsUseCase } from '../../../application/use-cases/worker-profile/UpdateWorkerSkillsUseCase';
import { SearchWorkersUseCase } from '../../../application/use-cases/worker-listing/SearchWorkersUseCase';
import { GamificationServiceImpl } from '../../../infrastructure/services/GamificationServiceImpl';
import { PostgresPointRepository } from '../../../infrastructure/repositories/PostgresPointRepository';
import { PostgresAchievementRepository } from '../../../infrastructure/repositories/PostgresAchievementRepository';

const workerProfileRepo = new PostgresWorkerProfileRepository();
const skillRepo = new PostgresSkillRepository();

const pointRepo = new PostgresPointRepository();
const achievementRepo = new PostgresAchievementRepository();
const gamificationService = new GamificationServiceImpl(pointRepo, achievementRepo);

const getMyProfile = new GetMyWorkerProfileUseCase(workerProfileRepo, skillRepo);
const updateProfile = new UpdateWorkerProfileUseCase(workerProfileRepo, gamificationService);
const updateSkills = new UpdateWorkerSkillsUseCase(workerProfileRepo, skillRepo, gamificationService);
const searchWorkers = new SearchWorkersUseCase(workerProfileRepo);

export class WorkerController {
  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await getMyProfile.execute(userId);
      res.status(200).json({ success: true, data: { profile: result.profile, skills: result.skills } });
    } catch (error) { next(error); }
  }

  static async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const updated = await updateProfile.execute(userId, req.body);
      res.status(200).json({ success: true, data: { profile: updated } });
    } catch (error) { next(error); }
  }

  static async updateMySkills(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const skills = await updateSkills.execute(userId, req.body.skillIds);
      res.status(200).json({ success: true, data: { skills } });
    } catch (error) { next(error); }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        ...req.query,
        skillIds: req.query.skillIds ? (req.query.skillIds as string).split(',') : undefined,
      };
      const result = await searchWorkers.execute(filters as any);
      res.status(200).json({
        success: true,
        data: {
          workers: result.data.map(w => ({
            id: w.profile.id,
            userId: w.user.id,
            fullName: w.user.fullName,
            avatarUrl: w.user.avatarUrl,
            title: w.profile.title,
            bio: w.user.bio,
            hourlyRate: w.profile.hourlyRate,
            experienceYears: w.profile.experienceYears,
            availability: w.profile.availability,
            ratingAverage: w.profile.ratingAverage,
            ratingCount: w.profile.ratingCount,
            jobsCompleted: w.profile.jobsCompleted,
            skills: w.skills,
          })),
          pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
        },
      });
    } catch (error) { next(error); }
  }
}
