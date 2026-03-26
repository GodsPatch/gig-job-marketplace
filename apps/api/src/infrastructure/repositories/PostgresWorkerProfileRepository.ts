import { query } from '../database/connection';
import { WorkerProfile } from '../../domain/entities/WorkerProfile';
import { IWorkerProfileRepository, WorkerListFilters, PaginatedWorkerResult, WorkerProfileWithUser } from '../../domain/repositories/IWorkerProfileRepository';
import { sanitizeSearchInput } from '../../shared/utils/sanitizeSearch';

export class PostgresWorkerProfileRepository implements IWorkerProfileRepository {
  private mapRow(row: any): WorkerProfile {
    return new WorkerProfile({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : null,
      experienceYears: row.experience_years,
      availability: row.availability,
      portfolioUrl: row.portfolio_url,
      isVisible: row.is_visible,
      ratingAverage: Number(row.rating_average),
      ratingCount: row.rating_count,
      jobsCompleted: row.jobs_completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByUserId(userId: string): Promise<WorkerProfile | null> {
    const result = await query('SELECT * FROM worker_profiles WHERE user_id = $1', [userId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(profile: WorkerProfile): Promise<WorkerProfile> {
    const result = await query(
      `INSERT INTO worker_profiles (id, user_id, title, hourly_rate, experience_years, availability, portfolio_url, is_visible, rating_average, rating_count, jobs_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [profile.id, profile.userId, profile.title, profile.hourlyRate, profile.experienceYears, profile.availability, profile.portfolioUrl, profile.isVisible, profile.ratingAverage, profile.ratingCount, profile.jobsCompleted]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(profile: WorkerProfile): Promise<WorkerProfile> {
    const result = await query(
      `UPDATE worker_profiles SET title=$1, hourly_rate=$2, experience_years=$3, availability=$4, portfolio_url=$5, is_visible=$6, updated_at=NOW()
       WHERE id = $7 RETURNING *`,
      [profile.title, profile.hourlyRate, profile.experienceYears, profile.availability, profile.portfolioUrl, profile.isVisible, profile.id]
    );
    return this.mapRow(result.rows[0]);
  }

  async updateRating(userId: string, average: number, count: number): Promise<void> {
    // Update worker_profiles if exists
    await query(
      'UPDATE worker_profiles SET rating_average=$1, rating_count=$2 WHERE user_id=$3',
      [average, count, userId]
    );
    // Also update users table 
    await query(
      'UPDATE users SET rating_average=$1, rating_count=$2 WHERE id=$3',
      [average, count, userId]
    );
  }

  async findVisible(filters: WorkerListFilters): Promise<PaginatedWorkerResult> {
    const conditions: string[] = [
      'wp.is_visible = true',
      'wp.title IS NOT NULL',
      `EXISTS (SELECT 1 FROM worker_skills ws WHERE ws.worker_profile_id = wp.id)`,
    ];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.keyword) {
      conditions.push(`(wp.title ILIKE $${paramIdx} OR u.bio ILIKE $${paramIdx})`);
      params.push(`%${sanitizeSearchInput(filters.keyword)}%`);
      paramIdx++;
    }

    if (filters.skillIds && filters.skillIds.length > 0) {
      // AND logic: worker must have ALL specified skills
      for (const skillId of filters.skillIds) {
        conditions.push(`EXISTS (SELECT 1 FROM worker_skills ws2 WHERE ws2.worker_profile_id = wp.id AND ws2.skill_id = $${paramIdx})`);
        params.push(skillId);
        paramIdx++;
      }
    }

    if (filters.categoryId) {
      conditions.push(`EXISTS (SELECT 1 FROM worker_skills ws3 JOIN skills s ON s.id = ws3.skill_id WHERE ws3.worker_profile_id = wp.id AND s.category_id = $${paramIdx})`);
      params.push(filters.categoryId);
      paramIdx++;
    }

    if (filters.availability) {
      conditions.push(`wp.availability = $${paramIdx}`);
      params.push(filters.availability);
      paramIdx++;
    }

    if (filters.hourlyRateMin !== undefined) {
      conditions.push(`wp.hourly_rate >= $${paramIdx}`);
      params.push(filters.hourlyRateMin);
      paramIdx++;
    }

    if (filters.hourlyRateMax !== undefined) {
      conditions.push(`wp.hourly_rate <= $${paramIdx}`);
      params.push(filters.hourlyRateMax);
      paramIdx++;
    }

    if (filters.ratingMin !== undefined) {
      conditions.push(`wp.rating_average >= $${paramIdx}`);
      params.push(filters.ratingMin);
      paramIdx++;
    }

    if (filters.experienceMin !== undefined) {
      conditions.push(`wp.experience_years >= $${paramIdx}`);
      params.push(filters.experienceMin);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'wp.rating_average DESC';
    switch (filters.sort) {
      case 'experience_desc': orderBy = 'wp.experience_years DESC NULLS LAST'; break;
      case 'hourly_rate_asc': orderBy = 'wp.hourly_rate ASC NULLS LAST'; break;
      case 'hourly_rate_desc': orderBy = 'wp.hourly_rate DESC NULLS LAST'; break;
      case 'newest': orderBy = 'wp.created_at DESC'; break;
      default: orderBy = 'wp.rating_average DESC';
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    // Count
    const countResult = await query(
      `SELECT COUNT(DISTINCT wp.id)::int as total FROM worker_profiles wp JOIN users u ON u.id = wp.user_id ${whereClause}`,
      params
    );
    const total = countResult.rows[0]?.total || 0;

    // Data
    const dataResult = await query(
      `SELECT wp.*, u.full_name, u.avatar_url, u.bio, u.id as uid
       FROM worker_profiles wp
       JOIN users u ON u.id = wp.user_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    // Fetch skills for all workers in result
    const profiles: WorkerProfileWithUser[] = [];
    for (const row of dataResult.rows) {
      const skillsResult = await query(
        `SELECT s.id, s.name, s.slug FROM worker_skills ws JOIN skills s ON s.id = ws.skill_id WHERE ws.worker_profile_id = $1`,
        [row.id]
      );

      profiles.push({
        profile: this.mapRow(row),
        user: {
          id: row.uid,
          fullName: row.full_name,
          avatarUrl: row.avatar_url,
          bio: row.bio,
        },
        skills: skillsResult.rows.map((s: any) => ({ id: s.id, name: s.name, slug: s.slug })),
      });
    }

    return {
      data: profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
