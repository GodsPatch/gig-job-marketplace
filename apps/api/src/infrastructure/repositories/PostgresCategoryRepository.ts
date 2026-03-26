import { ICategoryRepository, CategoryWithJobCount } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { query } from '../database/connection';
import { cacheGet, cacheSet, CACHE_TTL } from '../cache';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function rowToCategory(row: CategoryRow): Category {
  return Category.create({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    displayOrder: row.display_order,
    isActive: row.is_active,
  });
}

export class PostgresCategoryRepository implements ICategoryRepository {
  async findAll(activeOnly: boolean = false): Promise<Category[]> {
    let sql = 'SELECT * FROM categories';
    if (activeOnly) {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY display_order ASC';

    const result = await query<CategoryRow>(sql);
    return result.rows.map(rowToCategory);
  }

  async findAllWithJobCount(): Promise<CategoryWithJobCount[]> {
    // Check cache first
    const cacheKey = 'categories:with_job_count';
    const cached = cacheGet<CategoryWithJobCount[]>(cacheKey);
    if (cached) return cached;

    const result = await query<{ job_count: string } & CategoryRow>(
      `SELECT c.*, COUNT(j.id) FILTER (WHERE j.status = 'published') as job_count
       FROM categories c
       LEFT JOIN jobs j ON j.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.display_order ASC`
    );

    const data = result.rows.map(row => ({
      category: rowToCategory(row),
      jobCount: parseInt(row.job_count, 10)
    }));

    cacheSet(cacheKey, data, CACHE_TTL.CATEGORIES);
    return data;
  }

  async findById(id: string): Promise<Category | null> {
    const result = await query<CategoryRow>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] ? rowToCategory(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await query<CategoryRow>(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0] ? rowToCategory(result.rows[0]) : null;
  }
}
