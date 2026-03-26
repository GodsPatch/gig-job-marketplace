import { Request, Response, NextFunction } from 'express';
import { PostgresReviewRepository } from '../../../infrastructure/repositories/PostgresReviewRepository';
import { PostgresJobRepository } from '../../../infrastructure/repositories/PostgresJobRepository';
import { PostgresUserRepository } from '../../../infrastructure/repositories/PostgresUserRepository';
import { PostgresWorkerProfileRepository } from '../../../infrastructure/repositories/PostgresWorkerProfileRepository';
import { CreateReviewUseCase } from '../../../application/use-cases/review/CreateReviewUseCase';
import { ListJobReviewsUseCase } from '../../../application/use-cases/review/ListJobReviewsUseCase';
import { ListUserReviewsUseCase } from '../../../application/use-cases/review/ListUserReviewsUseCase';
import { GamificationServiceImpl } from '../../../infrastructure/services/GamificationServiceImpl';
import { PostgresPointRepository } from '../../../infrastructure/repositories/PostgresPointRepository';
import { PostgresAchievementRepository } from '../../../infrastructure/repositories/PostgresAchievementRepository';

const reviewRepo = new PostgresReviewRepository();
const jobRepo = new PostgresJobRepository();
const userRepo = new PostgresUserRepository();
const workerProfileRepo = new PostgresWorkerProfileRepository();

const pointRepo = new PostgresPointRepository();
const achievementRepo = new PostgresAchievementRepository();
const gamificationService = new GamificationServiceImpl(pointRepo, achievementRepo);

const createReview = new CreateReviewUseCase(reviewRepo, jobRepo, userRepo, workerProfileRepo, gamificationService);
const listJobReviews = new ListJobReviewsUseCase(reviewRepo);
const listUserReviews = new ListUserReviewsUseCase(reviewRepo);

export class ReviewController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = (req as any).user.userId;
      const jobId = req.params.jobId as string;
      const review = await createReview.execute({
        jobId,
        reviewerId,
        revieweeId: req.body.revieweeId,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      res.status(201).json({ success: true, data: { review } });
    } catch (error) { next(error); }
  }

  static async listByJob(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await listJobReviews.execute(req.params.jobId as string);
      res.status(200).json({ success: true, data: { reviews } });
    } catch (error) { next(error); }
  }

  static async listByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listUserReviews.execute(req.params.userId as string, req.query as any);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}
