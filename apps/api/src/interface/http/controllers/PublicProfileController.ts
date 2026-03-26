import { Request, Response, NextFunction } from 'express';
import { PostgresUserRepository } from '../../../infrastructure/repositories/PostgresUserRepository';
import { PostgresWorkerProfileRepository } from '../../../infrastructure/repositories/PostgresWorkerProfileRepository';
import { PostgresSkillRepository } from '../../../infrastructure/repositories/PostgresSkillRepository';
import { PostgresReviewRepository } from '../../../infrastructure/repositories/PostgresReviewRepository';
import { PostgresJobRepository } from '../../../infrastructure/repositories/PostgresJobRepository';
import { GetPublicProfileUseCase } from '../../../application/use-cases/public-profile/GetPublicProfileUseCase';

const userRepo = new PostgresUserRepository();
const workerProfileRepo = new PostgresWorkerProfileRepository();
const skillRepo = new PostgresSkillRepository();
const reviewRepo = new PostgresReviewRepository();
const jobRepo = new PostgresJobRepository();
const getPublicProfile = new GetPublicProfileUseCase(userRepo, workerProfileRepo, skillRepo, reviewRepo, jobRepo);

export class PublicProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getPublicProfile.execute(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }
}
