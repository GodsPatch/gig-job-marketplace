import { query } from '../database/connection';
import { Review } from '../../domain/entities/Review';
import { IReviewRepository, ReviewWithDetails, ReviewListFilters, PaginatedReviewResult } from '../../domain/repositories/IReviewRepository';

export class PostgresReviewRepository implements IReviewRepository {
  private mapRow(row: any): Review {
    return new Review({
      id: row.id,
      jobId: row.job_id,
      reviewerId: row.reviewer_id,
      revieweeId: row.reviewee_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    });
  }

  async create(review: Review): Promise<Review> {
    const result = await query(
      `INSERT INTO reviews (id, job_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [review.id, review.jobId, review.reviewerId, review.revieweeId, review.rating, review.comment]
    );
    return this.mapRow(result.rows[0]);
  }

  async findByJobId(jobId: string): Promise<ReviewWithDetails[]> {
    const result = await query(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar, u.role as reviewer_role,
              j.title as job_title, j.slug as job_slug
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       JOIN jobs j ON j.id = r.job_id
       WHERE r.job_id = $1
       ORDER BY r.created_at DESC`,
      [jobId]
    );
    return result.rows.map(row => ({
      review: this.mapRow(row),
      reviewer: { id: row.reviewer_id, fullName: row.reviewer_name, avatarUrl: row.reviewer_avatar, role: row.reviewer_role },
      job: { id: row.job_id, title: row.job_title, slug: row.job_slug },
    }));
  }

  async findByRevieweeId(userId: string, filters: ReviewListFilters): Promise<PaginatedReviewResult> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let orderBy = 'r.created_at DESC';
    if (filters.sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
    if (filters.sort === 'lowest') orderBy = 'r.rating ASC, r.created_at DESC';

    const countResult = await query(
      'SELECT COUNT(*)::int as total FROM reviews WHERE reviewee_id = $1',
      [userId]
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await query(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar, u.role as reviewer_role,
              j.title as job_title, j.slug as job_slug
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       JOIN jobs j ON j.id = r.job_id
       WHERE r.reviewee_id = $1
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      data: result.rows.map(row => ({
        review: this.mapRow(row),
        reviewer: { id: row.reviewer_id, fullName: row.reviewer_name, avatarUrl: row.reviewer_avatar, role: row.reviewer_role },
        job: { id: row.job_id, title: row.job_title, slug: row.job_slug },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByReviewerAndJob(reviewerId: string, jobId: string): Promise<Review | null> {
    const result = await query(
      'SELECT * FROM reviews WHERE reviewer_id = $1 AND job_id = $2',
      [reviewerId, jobId]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async getAverageRating(revieweeId: string): Promise<{ average: number; count: number }> {
    const result = await query(
      'SELECT COALESCE(AVG(rating), 0)::numeric(3,2) as average, COUNT(*)::int as count FROM reviews WHERE reviewee_id = $1',
      [revieweeId]
    );
    return {
      average: Number(result.rows[0]?.average || 0),
      count: result.rows[0]?.count || 0,
    };
  }

  async getRatingDistribution(revieweeId: string): Promise<Record<number, number>> {
    const result = await query(
      `SELECT rating, COUNT(*)::int as count FROM reviews WHERE reviewee_id = $1 GROUP BY rating ORDER BY rating`,
      [revieweeId]
    );
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of result.rows) {
      dist[row.rating] = row.count;
    }
    return dist;
  }
}
