import { IReviewRepository } from '../../../domain/repositories/IReviewRepository';
import { IJobRepository } from '../../../domain/repositories/IJobRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IWorkerProfileRepository } from '../../../domain/repositories/IWorkerProfileRepository';
import { Review } from '../../../domain/entities/Review';
import { JobNotClosedError, DuplicateReviewError, ReviewNotAllowedError } from '../../../domain/errors/M5Errors';
import { v4 as uuidv4 } from 'uuid';
import { IGamificationService } from '../../services/GamificationService';

export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly jobRepo: IJobRepository,
    private readonly userRepo: IUserRepository,
    private readonly workerProfileRepo: IWorkerProfileRepository,
    private readonly gamificationService?: IGamificationService
  ) {}

  async execute(params: { jobId: string; reviewerId: string; revieweeId: string; rating: number; comment?: string }) {
    // 1. Find job
    const job = await this.jobRepo.findById(params.jobId);
    if (!job) throw new Error('Job not found');

    // 2. Find reviewee
    const reviewee = await this.userRepo.findById(params.revieweeId);
    if (!reviewee) throw new Error('Reviewee not found');

    // 3. Check existing review
    const existing = await this.reviewRepo.findByReviewerAndJob(params.reviewerId, params.jobId);

    // 4. Validate business rules
    const validation = Review.validateCanReview({
      job,
      reviewerId: params.reviewerId,
      revieweeId: params.revieweeId,
      existingReview: existing,
    });

    if (!validation.valid) {
      if (validation.error?.includes('closed')) throw new JobNotClosedError();
      if (validation.error?.includes('already')) throw new DuplicateReviewError();
      throw new ReviewNotAllowedError(validation.error || 'Not allowed');
    }

    // 5. Create review
    const review = Review.create({
      id: uuidv4(),
      jobId: params.jobId,
      reviewerId: params.reviewerId,
      revieweeId: params.revieweeId,
      rating: params.rating,
      comment: params.comment || null,
    });

    const saved = await this.reviewRepo.create(review);

    // 6. Recalculate rating for reviewee
    const { average, count } = await this.reviewRepo.getAverageRating(params.revieweeId);

    if (reviewee.role === 'worker') {
      await this.workerProfileRepo.updateRating(params.revieweeId, average, count);
    }
    // Also update users table rating for any role (employer rating)
    await this.updateUserRating(params.revieweeId, average, count);

    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'review_given',
        userId: params.reviewerId,
        data: { referenceId: saved.id, referenceType: 'review' }
      });
      await this.gamificationService.handleEvent({
        type: 'review_received',
        userId: params.revieweeId,
        data: { referenceId: saved.id, referenceType: 'review' }
      });
      if (params.rating >= 4) {
        await this.gamificationService.handleEvent({
          type: 'review_received_good',
          userId: params.revieweeId,
          data: { referenceId: saved.id, referenceType: 'review' }
        });
      }
    }

    return saved;
  }

  private async updateUserRating(userId: string, average: number, count: number): Promise<void> {
    // Direct SQL update through user repo or review context
    // We'll use a simple approach through the worker profile repo's updateRating
    // which updates both worker_profiles and users tables
    try {
      await this.workerProfileRepo.updateRating(userId, average, count);
    } catch {
      // Employer may not have worker_profile — that's fine, handled in repo
    }
  }
}
