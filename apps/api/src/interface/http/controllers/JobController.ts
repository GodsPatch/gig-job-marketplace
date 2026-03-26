import { Request, Response, NextFunction } from 'express';
import { PostgresJobRepository } from '../../../infrastructure/repositories/PostgresJobRepository';
import { PostgresCategoryRepository } from '../../../infrastructure/repositories/PostgresCategoryRepository';
import { SlugService } from '../../../infrastructure/services/SlugService';
import { GamificationServiceImpl } from '../../../infrastructure/services/GamificationServiceImpl';
import { PostgresPointRepository } from '../../../infrastructure/repositories/PostgresPointRepository';
import { PostgresAchievementRepository } from '../../../infrastructure/repositories/PostgresAchievementRepository';

import { CreateJobUseCase } from '../../../application/use-cases/job/CreateJobUseCase';
import { UpdateJobUseCase } from '../../../application/use-cases/job/UpdateJobUseCase';
import { PublishJobUseCase } from '../../../application/use-cases/job/PublishJobUseCase';
import { CloseJobUseCase } from '../../../application/use-cases/job/CloseJobUseCase';
import { GetJobDetailUseCase } from '../../../application/use-cases/job/GetJobDetailUseCase';
import { ListOwnerJobsUseCase } from '../../../application/use-cases/job/ListOwnerJobsUseCase';
import { SearchPublicJobsUseCase } from '../../../application/use-cases/job/SearchPublicJobsUseCase';

const jobRepo = new PostgresJobRepository();
const catRepo = new PostgresCategoryRepository();
const slugSvc = new SlugService(jobRepo);

const pointRepo = new PostgresPointRepository();
const achievementRepo = new PostgresAchievementRepository();
const gamificationService = new GamificationServiceImpl(pointRepo, achievementRepo);

const createJob = new CreateJobUseCase(jobRepo, catRepo, slugSvc);
const updateJob = new UpdateJobUseCase(jobRepo, catRepo);
const publishJob = new PublishJobUseCase(jobRepo, gamificationService);
const closeJob = new CloseJobUseCase(jobRepo, gamificationService);
const getJobDetail = new GetJobDetailUseCase(jobRepo);
const listOwnerJobs = new ListOwnerJobsUseCase(jobRepo);
const searchPublicJobs = new SearchPublicJobsUseCase(jobRepo, catRepo);

export class JobController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const job = await createJob.execute(req.body, userId, role);
      res.status(201).json({ success: true, data: { job } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const jobId = req.params.id as string;
      const job = await updateJob.execute(jobId, req.body, userId);
      res.status(200).json({ success: true, data: { job } });
    } catch (error) { next(error); }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const jobId = req.params.id as string;
      const job = await publishJob.execute(jobId, userId);
      res.status(200).json({ success: true, data: { job } });
    } catch (error) { next(error); }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const jobId = req.params.id as string;
      const job = await closeJob.execute(jobId, userId);
      res.status(200).json({ success: true, data: { job } });
    } catch (error) { next(error); }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.userId : null;
      const isAdmin = req.user?.role === 'admin';
      const slug = req.params.slug as string;
      const job = await getJobDetail.execute(slug, userId, isAdmin);
      res.status(200).json({ success: true, data: { job } });
    } catch (error) { next(error); }
  }

  static async listOwn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const filterStr = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        sort: req.query.sort as string,
        status: req.query.status as string,
      };
      const result = await listOwnerJobs.execute(userId, filterStr);
      res.status(200).json({
        success: true,
        data: {
          jobs: result.data,
          pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
        }
      });
    } catch (error) { next(error); }
  }

  static async searchPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchPublicJobs.execute(req.query as any);
      res.status(200).json({
        success: true,
        data: {
          jobs: result.data,
          pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
          filters: result.filters
        }
      });
    } catch (error) { next(error); }
  }
}
