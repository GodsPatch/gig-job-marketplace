import { query } from '../database/connection';
import { IAchievementRepository } from '../../domain/repositories/IAchievementRepository';
import { Achievement } from '../../domain/entities/Achievement';
import { UserAchievement } from '../../domain/entities/UserAchievement';
import { AchievementTier } from '../../domain/value-objects/AchievementTier';
import { cacheGet, cacheSet, CACHE_TTL } from '../cache';

export class PostgresAchievementRepository implements IAchievementRepository {
  async findAllDefinitions(activeOnly: boolean = true): Promise<Achievement[]> {
    const cacheKey = `achievements:all:${activeOnly}`;
    const cached = cacheGet<Achievement[]>(cacheKey);
    if (cached) return cached;

    const sql = activeOnly ? `SELECT * FROM achievement_definitions WHERE is_active = true ORDER BY display_order ASC` :
                             `SELECT * FROM achievement_definitions ORDER BY display_order ASC`;
    const res = await query(sql);
    const achievements = res.rows.map(r => new Achievement(
      r.id, r.code, r.name, r.description, r.icon, r.tier as AchievementTier, r.condition_type, r.condition_threshold, r.is_active, r.display_order, r.points_reward, r.created_at
    ));

    cacheSet(cacheKey, achievements, CACHE_TTL.ACHIEVEMENTS);
    return achievements;
  }

  async findUserAchievements(userId: string): Promise<UserAchievement[]> {
    const res = await query(`SELECT * FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at DESC`, [userId]);
    return res.rows.map(r => new UserAchievement(r.id, r.user_id, r.achievement_id, r.unlocked_at));
  }

  async findUnlockedByUser(userId: string): Promise<Achievement[]> {
    const res = await query(`
      SELECT ad.* FROM achievement_definitions ad
      JOIN user_achievements ua ON ad.id = ua.achievement_id
      WHERE ua.user_id = $1
      ORDER BY ad.display_order ASC
    `, [userId]);
    return res.rows.map(r => new Achievement(
       r.id, r.code, r.name, r.description, r.icon, r.tier as AchievementTier, r.condition_type, r.condition_threshold, r.is_active, r.display_order, r.points_reward, r.created_at
    ));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const res = await query(
      `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) RETURNING *`,
      [userId, achievementId]
    );
    const row = res.rows[0];
    if (!row) throw new Error('Failed to record achievement unlock');
    return new UserAchievement(row.id, row.user_id, row.achievement_id, row.unlocked_at);
  }

  async isUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const res = await query(
      `SELECT EXISTS(SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2)`,
      [userId, achievementId]
    );
    return res.rows[0]?.exists || false;
  }

  async getProgress(userId: string, achievement: Achievement): Promise<{ current: number; target: number }> {
    let current = 0;
    
    switch (achievement.conditionType) {
      case 'user_registered':
        current = 1; // Since they exist
        break;
      case 'profile_completed':
        const profRes = await query(`SELECT * FROM worker_profiles WHERE user_id = $1`, [userId]);
        if (profRes.rows[0] && profRes.rows[0].title && profRes.rows[0].bio) {
          const skillsRes = await query(`SELECT COUNT(*) FROM worker_skills WHERE worker_profile_id = $1`, [profRes.rows[0].id]);
          if (parseInt(skillsRes.rows[0]?.count || '0', 10) >= 3) {
            current = 1;
          }
        }
        break;
      case 'jobs_published_count':
        const jobsRes = await query(`SELECT COUNT(*) FROM jobs WHERE created_by = $1 AND status IN ('published', 'closed')`, [userId]);
        current = parseInt(jobsRes.rows[0]?.count || '0', 10);
        break;
      case 'reviews_given_count':
        const revGivenRes = await query(`SELECT COUNT(*) FROM reviews WHERE reviewer_id = $1`, [userId]);
        current = parseInt(revGivenRes.rows[0]?.count || '0', 10);
        break;
      case 'good_reviews_received':
        const goodRevRes = await query(`SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND rating >= 4`, [userId]);
        current = parseInt(goodRevRes.rows[0]?.count || '0', 10);
        break;
      case 'high_rated_reviews':
        const highRevRes = await query(`SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND rating >= 4.5`, [userId]);
        current = parseInt(highRevRes.rows[0]?.count || '0', 10);
        break;
      case 'skills_count':
        const skRes = await query(`
          SELECT COUNT(*) FROM worker_skills ws
          JOIN worker_profiles wp ON ws.worker_profile_id = wp.id
          WHERE wp.user_id = $1
        `, [userId]);
        current = parseInt(skRes.rows[0]?.count || '0', 10);
        break;
      case 'login_streak':
        const lsRes = await query(`SELECT current_streak FROM user_points_summary WHERE user_id = $1`, [userId]);
        current = lsRes.rows[0] ? parseInt(lsRes.rows[0].current_streak, 10) : 0;
        break;
      case 'total_points':
        const tpRes = await query(`SELECT total_points FROM user_points_summary WHERE user_id = $1`, [userId]);
        current = tpRes.rows[0] ? parseInt(tpRes.rows[0].total_points, 10) : 0;
        break;
    }

    return { current: Math.min(current, achievement.conditionThreshold), target: achievement.conditionThreshold };
  }
}
