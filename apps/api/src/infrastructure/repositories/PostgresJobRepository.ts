import { IJobRepository, PaginatedResult, JobListFilters, PublicJobFilters } from '../../domain/repositories/IJobRepository';
import { Job } from '../../domain/entities/Job';
import { JobStatus } from '../../domain/value-objects/JobStatus';
import { BudgetType } from '../../domain/value-objects/BudgetType';
import { LocationType } from '../../domain/value-objects/LocationType';
import { query } from '../database/connection';
import { sanitizeSearchInput } from '../../shared/utils/sanitizeSearch';

interface JobRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  budget_type: string;
  budget_min: string | null; // numeric comes as string usually
  budget_max: string | null;
  location_type: string;
  location: string | null;
  status: string;
  created_by: string;
  published_at: Date | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  view_count?: number;
}

function rowToJob(row: JobRow): Job {
  return new (Job as any)({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    budgetType: BudgetType.fromString(row.budget_type),
    budgetMin: row.budget_min ? parseFloat(row.budget_min) : null,
    budgetMax: row.budget_max ? parseFloat(row.budget_max) : null,
    locationType: LocationType.fromString(row.location_type),
    location: row.location,
    status: JobStatus.fromString(row.status),
    createdBy: row.created_by,
    publishedAt: row.published_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewCount: row.view_count || 0,
  });
}

export class PostgresJobRepository implements IJobRepository {
  async create(job: Job): Promise<Job> {
    const result = await query<JobRow>(
      `INSERT INTO jobs (
        id, title, slug, description, category_id,
        budget_type, budget_min, budget_max,
        location_type, location, status,
        created_by, published_at, closed_at,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15
      ) RETURNING *`,
      [
        job.title, job.slug, job.description, job.categoryId,
        job.budgetType.value, job.budgetMin, job.budgetMax,
        job.locationType.value, job.location, job.status.value,
        job.createdBy, job.publishedAt, job.closedAt,
        job.createdAt, job.updatedAt
      ]
    );
    return rowToJob(result.rows[0]!);
  }

  async findById(id: string): Promise<Job | null> {
    /* For simplicity here, we don't strictly do JOINs to map inner nested objects since the DDD 
    repository returns the Root Entity, but the Use Case or Controller maps it doing JOINs or separate queries.
    Returning mapping logic strictly. */
    const result = await query<JobRow>(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToJob(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Job | null> {
    const result = await query<JobRow>(
      'SELECT * FROM jobs WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ? rowToJob(result.rows[0]) : null;
  }

  async update(job: Job): Promise<Job> {
    const result = await query<JobRow>(
      `UPDATE jobs SET
        title = $2, description = $3, category_id = $4,
        budget_type = $5, budget_min = $6, budget_max = $7,
        location_type = $8, location = $9, status = $10,
        published_at = $11, closed_at = $12, updated_at = $13
      WHERE id = $1 RETURNING *`,
      [
        job.id, job.title, job.description, job.categoryId,
        job.budgetType.value, job.budgetMin, job.budgetMax,
        job.locationType.value, job.location, job.status.value,
        job.publishedAt, job.closedAt, job.updatedAt
      ]
    );
    return rowToJob(result.rows[0]!);
  }

  async findByOwner(userId: string, filters: JobListFilters): Promise<PaginatedResult<Job>> {
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM jobs WHERE created_by = $1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    // simplistic sort handling (createdAt:desc)
    sql += ' ORDER BY created_at DESC';
    
    const countSql = `SELECT COUNT(*) FROM (${sql}) AS c`;
    const totalResult = await query<{ count: string }>(countSql, params);
    const total = parseInt(totalResult.rows[0]?.count || '0', 10);

    // add limit and offset
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query<JobRow>(sql, params);
    return {
      data: result.rows.map(rowToJob),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM jobs WHERE slug = $1) as exists',
      [slug]
    );
    return result.rows[0]?.exists ?? false;
  }

  async incrementViewCount(jobId: string): Promise<void> {
    await query(
      'UPDATE jobs SET view_count = view_count + 1 WHERE id = $1',
      [jobId]
    );
  }

  async findPublished(filters: PublicJobFilters): Promise<PaginatedResult<Job>> {
    const limit = filters.limit || 12;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT j.*, 
             (j.view_count + GREATEST(0, 7 - EXTRACT(DAY FROM NOW() - j.published_at)) * 10) as trending_score
      FROM jobs j
      WHERE j.status = 'published'
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters.keyword && filters.keyword.trim().length >= 2) {
      const words = filters.keyword.trim().split(/\s+/);
      for (const word of words) {
        paramCount++;
        sql += ` AND (j.title ILIKE '%' || $${paramCount} || '%' OR j.description ILIKE '%' || $${paramCount} || '%')`;
        params.push(sanitizeSearchInput(word));
      }
    }

    if (filters.categoryId) {
      paramCount++;
      sql += ` AND j.category_id = $${paramCount}`;
      params.push(filters.categoryId);
    }

    if (filters.locationType) {
      paramCount++;
      sql += ` AND j.location_type = $${paramCount}`;
      params.push(filters.locationType);
    }

    if (filters.budgetType) {
      paramCount++;
      sql += ` AND j.budget_type = $${paramCount}`;
      params.push(filters.budgetType);
    }

    if (filters.budgetMin) {
      paramCount++;
      sql += ` AND j.budget_max >= $${paramCount}`;
      params.push(filters.budgetMin);
    }

    if (filters.budgetMax) {
      paramCount++;
      sql += ` AND j.budget_min <= $${paramCount}`;
      params.push(filters.budgetMax);
    }

    const countSql = `SELECT COUNT(*) FROM (${sql}) AS c`;
    const totalResult = await query<{ count: string }>(countSql, params);
    const total = parseInt(totalResult.rows[0]?.count || '0', 10);

    let sortSql = '';
    switch (filters.sort) {
      case 'newest': sortSql = ' ORDER BY j.published_at DESC'; break;
      case 'oldest': sortSql = ' ORDER BY j.published_at ASC'; break;
      case 'budget_desc': sortSql = ' ORDER BY j.budget_max DESC NULLS LAST'; break;
      case 'budget_asc': sortSql = ' ORDER BY j.budget_min ASC NULLS LAST'; break;
      case 'trending': sortSql = ' ORDER BY trending_score DESC'; break;
      default: sortSql = ' ORDER BY j.published_at DESC'; break;
    }
    sql += sortSql;

    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query<JobRow>(sql, params);
    return {
      data: result.rows.map(rowToJob),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
