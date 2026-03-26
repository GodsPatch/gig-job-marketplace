import { query } from '../connection';
import { logger } from '../../logging';
import { randomUUID } from 'crypto';

export async function seedSampleJobs(): Promise<void> {
  logger.info('Seeding sample published jobs...');

  try {
    const userResult = await query(`SELECT id FROM users LIMIT 1`);
    let userId = userResult.rows[0]?.id;

    if (!userId) {
      userId = randomUUID();
      await query(`
        INSERT INTO users (id, email, password_hash, full_name, role, status)
        VALUES ($1, 'employer_${Date.now()}@gig.com', 'nohash', 'Employer Gen', 'employer', 'active')
        ON CONFLICT DO NOTHING
      `, [userId]);
    }

    const catResult = await query(`SELECT id, name FROM categories`);
    if (catResult.rows.length === 0) {
      logger.warn('No categories found! Skipping jobs seed.');
      return;
    }
    const categories = catResult.rows;

    const sampleTitles = [
      'Tuyển lập trình viên Frontend React Native',
      'Cần dev Next.js làm Landing Page gấp',
      'Thiết kế logo nhận diện thương hiệu cho quán Cafe',
      'Chạy chiến dịch Facebook Ads thời trang nữ',
      'Viết bài chuẩn SEO lĩnh vực sức khỏe',
      'Dịch thuật Anh-Việt tài liệu kỹ thuật',
      'Dựng video TikTok ngắn cho shop quần áo',
      'Cần gia sư tiếng Anh giao tiếp online',
      'Tìm người vẽ minh họa sách thiếu nhi',
      'Tối ưu page speed cho trang web WordPress'
    ];

    const budgetTypes = ['fixed', 'hourly', 'negotiable'];
    const locationTypes = ['remote', 'onsite', 'hybrid'];

    let count = 0;
    for (let i = 0; i < 30; i++) {
      const isPublished = true;
      const title = `${sampleTitles[i % sampleTitles.length]} - Part ${i}`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
      const description = `Đây là nội dung mô tả công việc chi tiết cho "${title}". Chúng tôi đang tìm kiếm ứng viên phù hợp với nhiều năm kinh nghiệm. Yêu cầu làm việc chăm chỉ, đúng deadline. Keywords: React, Nodejs, Design, Marketing, SEO.`;
      
      const categoryId = categories[Math.floor(Math.random() * categories.length)]!.id;
      const budgetType = budgetTypes[Math.floor(Math.random() * budgetTypes.length)]!;
      const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)]!;
      
      let budgetMin = null;
      let budgetMax = null;
      if (budgetType !== 'negotiable') {
        budgetMin = Math.floor(Math.random() * 5 + 1) * 1000000;
        budgetMax = budgetMin + Math.floor(Math.random() * 5 + 1) * 1000000;
      }
      
      const status = isPublished ? 'published' : 'draft';
      const viewCount = Math.floor(Math.random() * 500); // 0 to 500
      
      // Random published date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const publishedAt = isPublished ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString() : null;

      await query(`
        INSERT INTO jobs (
          title, slug, description, category_id, budget_type, budget_min, budget_max,
          location_type, location, status, created_by, published_at, view_count,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING
      `, [
        title, slug, description, categoryId, budgetType, budgetMin, budgetMax,
        locationType, 'Vietnam', status, userId, publishedAt, viewCount
      ]);
      count++;
    }

    logger.info(`Successfully seeded ${count} sample jobs.`);
  } catch (error) {
    logger.error('Failed to seed sample jobs:', error);
  }
}
