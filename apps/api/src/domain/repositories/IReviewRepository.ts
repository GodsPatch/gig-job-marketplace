import { Review } from '../entities/Review';

export interface ReviewWithDetails {
  review: Review;
  reviewer: { id: string; fullName: string; avatarUrl: string | null; role: string };
  job: { id: string; title: string; slug: string };
}

export interface ReviewListFilters {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedReviewResult {
  data: ReviewWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IReviewRepository {
  create(review: Review): Promise<Review>;
  findByJobId(jobId: string): Promise<ReviewWithDetails[]>;
  findByRevieweeId(userId: string, filters: ReviewListFilters): Promise<PaginatedReviewResult>;
  findByReviewerAndJob(reviewerId: string, jobId: string): Promise<Review | null>;
  getAverageRating(revieweeId: string): Promise<{ average: number; count: number }>;
  getRatingDistribution(revieweeId: string): Promise<Record<number, number>>;
}
