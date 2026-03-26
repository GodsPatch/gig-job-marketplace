import { query } from '../../database/connection';
import { logger } from '../../../infrastructure/logging';

/**
 * Seed skills — 29 skills grouped by existing categories.
 * Idempotent via ON CONFLICT DO NOTHING on slug.
 */
export async function seedSkills(): Promise<void> {
  logger.info('Seeding skills...');

  await query(`
    INSERT INTO skills (name, slug, category_id) VALUES
      ('JavaScript', 'javascript', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('TypeScript', 'typescript', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('React', 'react', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('Node.js', 'nodejs', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('Python', 'python', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('Java', 'java', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('Flutter', 'flutter', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('PostgreSQL', 'postgresql', (SELECT id FROM categories WHERE slug = 'lap-trinh-cong-nghe')),
      ('UI/UX Design', 'ui-ux-design', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
      ('Figma', 'figma', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
      ('Adobe Photoshop', 'adobe-photoshop', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
      ('Logo Design', 'logo-design', (SELECT id FROM categories WHERE slug = 'thiet-ke')),
      ('SEO', 'seo', (SELECT id FROM categories WHERE slug = 'marketing')),
      ('Google Ads', 'google-ads', (SELECT id FROM categories WHERE slug = 'marketing')),
      ('Facebook Ads', 'facebook-ads', (SELECT id FROM categories WHERE slug = 'marketing')),
      ('Content Marketing', 'content-marketing', (SELECT id FROM categories WHERE slug = 'marketing')),
      ('Copywriting', 'copywriting', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
      ('Blog Writing', 'blog-writing', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
      ('Technical Writing', 'technical-writing', (SELECT id FROM categories WHERE slug = 'viet-noi-dung')),
      ('Anh-Việt', 'anh-viet', (SELECT id FROM categories WHERE slug = 'dich-thuat')),
      ('Nhật-Việt', 'nhat-viet', (SELECT id FROM categories WHERE slug = 'dich-thuat')),
      ('Video Editing', 'video-editing', (SELECT id FROM categories WHERE slug = 'video-animation')),
      ('Motion Graphics', 'motion-graphics', (SELECT id FROM categories WHERE slug = 'video-animation')),
      ('Data Entry', 'data-entry', (SELECT id FROM categories WHERE slug = 'nhap-lieu-admin')),
      ('Virtual Assistant', 'virtual-assistant', (SELECT id FROM categories WHERE slug = 'nhap-lieu-admin')),
      ('Business Consulting', 'business-consulting', (SELECT id FROM categories WHERE slug = 'tu-van-dao-tao')),
      ('Career Coaching', 'career-coaching', (SELECT id FROM categories WHERE slug = 'tu-van-dao-tao')),
      ('Bookkeeping', 'bookkeeping', (SELECT id FROM categories WHERE slug = 'ke-toan-tai-chinh')),
      ('Tax Consulting', 'tax-consulting', (SELECT id FROM categories WHERE slug = 'ke-toan-tai-chinh'))
    ON CONFLICT (slug) DO NOTHING;
  `);

  logger.info('Skills seeded (29 skills)');
}
