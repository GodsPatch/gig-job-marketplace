import { query } from '../database/connection';
import { Skill } from '../../domain/entities/Skill';
import { ISkillRepository } from '../../domain/repositories/ISkillRepository';
import { cacheGet, cacheSet, CACHE_TTL } from '../cache';

export class PostgresSkillRepository implements ISkillRepository {
  private mapRow(row: any): Skill {
    return new Skill({
      id: row.id,
      name: row.name,
      slug: row.slug,
      categoryId: row.category_id,
      isActive: row.is_active,
      createdAt: row.created_at,
    });
  }

  async findAll(): Promise<Skill[]> {
    const cacheKey = 'skills:all';
    const cached = cacheGet<Skill[]>(cacheKey);
    if (cached) return cached;

    const result = await query('SELECT * FROM skills WHERE is_active = true ORDER BY name');
    const skills = result.rows.map(r => this.mapRow(r));
    cacheSet(cacheKey, skills, CACHE_TTL.SKILLS);
    return skills;
  }

  async findByIds(ids: string[]): Promise<Skill[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(`SELECT * FROM skills WHERE id IN (${placeholders})`, ids);
    return result.rows.map(r => this.mapRow(r));
  }

  async findByCategoryId(categoryId: string): Promise<Skill[]> {
    const result = await query('SELECT * FROM skills WHERE category_id = $1 AND is_active = true ORDER BY name', [categoryId]);
    return result.rows.map(r => this.mapRow(r));
  }

  async findByWorkerProfileId(profileId: string): Promise<Skill[]> {
    const result = await query(
      `SELECT s.id, s.name, s.slug, s.category_id, s.is_active, s.created_at
       FROM worker_skills ws
       JOIN skills s ON s.id = ws.skill_id
       WHERE ws.worker_profile_id = $1
       ORDER BY s.name`,
      [profileId]
    );
    return result.rows.map(r => this.mapRow(r));
  }

  async setWorkerSkills(profileId: string, skillIds: string[]): Promise<void> {
    // Delete existing
    await query('DELETE FROM worker_skills WHERE worker_profile_id = $1', [profileId]);
    
    // Insert new
    if (skillIds.length > 0) {
      const values = skillIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await query(
        `INSERT INTO worker_skills (worker_profile_id, skill_id) VALUES ${values}`,
        [profileId, ...skillIds]
      );
    }
  }
}
