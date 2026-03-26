import { IReviewRepository } from '../../../domain/repositories/IReviewRepository';

export class ListJobReviewsUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  async execute(jobId: string) {
    return this.reviewRepo.findByJobId(jobId);
  }
}
