import { query } from '../connection';
import { logger } from '../../logging';

export async function seedAchievementDefinitions() {
  try {
    logger.info('Seeding achievement_definitions...');
    
    // Check if table exists (in case seed is run before migrations somehow)
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'achievement_definitions'
      );
    `);
    
    if (!tableCheck || !tableCheck.rows || !tableCheck.rows[0]?.exists) {
      logger.warn('Table achievement_definitions does not exist. Skipping seed.');
      return;
    }

    await query(`
      INSERT INTO achievement_definitions (code, name, description, icon, tier, condition_type, condition_threshold, display_order) VALUES
        ('newcomer', 'Newcomer', 'Chào mừng đến với Gig Marketplace!', '🌱', 'bronze', 'user_registered', 1, 1),
        ('profile_pro', 'Profile Pro', 'Hoàn thiện hồ sơ chuyên nghiệp', '👤', 'bronze', 'profile_completed', 1, 2),
        ('first_job_posted', 'First Job', 'Đăng việc đầu tiên', '📝', 'bronze', 'jobs_published_count', 1, 3),
        ('job_veteran', 'Job Veteran', 'Đăng 10 việc trên platform', '🏢', 'silver', 'jobs_published_count', 10, 4),
        ('job_champion', 'Job Champion', 'Đăng 50 việc trên platform', '🏆', 'gold', 'jobs_published_count', 50, 5),
        ('first_review', 'First Review', 'Viết đánh giá đầu tiên', '✍️', 'bronze', 'reviews_given_count', 1, 6),
        ('review_master', 'Review Master', 'Viết 10 đánh giá', '📋', 'silver', 'reviews_given_count', 10, 7),
        ('rising_star', 'Rising Star', 'Nhận đánh giá tốt đầu tiên (≥4★)', '⭐', 'bronze', 'good_reviews_received', 1, 8),
        ('top_rated', 'Top Rated', 'Nhận 10 đánh giá với trung bình ≥4.5★', '🌟', 'silver', 'high_rated_reviews', 10, 9),
        ('superstar', 'Superstar', 'Nhận 25 đánh giá với trung bình ≥4.5★', '💫', 'gold', 'high_rated_reviews', 25, 10),
        ('skill_collector', 'Skill Collector', 'Thêm 5 kỹ năng vào hồ sơ', '🧩', 'bronze', 'skills_count', 5, 11),
        ('skill_master', 'Skill Master', 'Thêm 10 kỹ năng vào hồ sơ', '🎯', 'silver', 'skills_count', 10, 12),
        ('loyal_member', 'Loyal Member', 'Đăng nhập 7 ngày liên tiếp', '📅', 'bronze', 'login_streak', 7, 13),
        ('dedicated', 'Dedicated', 'Đăng nhập 30 ngày liên tiếp', '🔥', 'silver', 'login_streak', 30, 14),
        ('century', 'Century', 'Tích lũy 1000 điểm', '💯', 'gold', 'total_points', 1000, 15)
      ON CONFLICT (code) DO UPDATE 
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          tier = EXCLUDED.tier,
          condition_type = EXCLUDED.condition_type,
          condition_threshold = EXCLUDED.condition_threshold,
          display_order = EXCLUDED.display_order;
    `);

    logger.info('Achievement definitions seeded successfully');
  } catch (error) {
    logger.error('Error seeding achievement_definitions:', error);
    throw error;
  }
}
