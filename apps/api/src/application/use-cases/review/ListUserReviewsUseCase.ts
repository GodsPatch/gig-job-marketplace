import { IReviewRepository, ReviewListFilters } from '../../../domain/repositories/IReviewRepository';

export class ListUserReviewsUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  async execute(userId: string, filters: ReviewListFilters) {
    const reviews = await this.reviewRepo.findByRevieweeId(userId, {
      page: filters.page || 1,
      limit: Math.min(filters.limit || 10, 50),
      sort: filters.sort || 'newest',
    });

    const distribution = await this.reviewRepo.getRatingDistribution(userId);
    const { average, count } = await this.reviewRepo.getAverageRating(userId);

    return {
      ...reviews,
      summary: {
        averageRating: average,
        totalReviews: count,
        distribution,
      },
    };
  }
}
