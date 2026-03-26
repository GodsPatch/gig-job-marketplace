-- Seed: categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Lập trình & Công nghệ', 'lap-trinh-cong-nghe', 'Phát triển phần mềm, web, mobile, AI/ML', 'code', 1),
  ('Thiết kế', 'thiet-ke', 'Thiết kế đồ họa, UI/UX, logo, branding', 'palette', 2),
  ('Marketing', 'marketing', 'Digital marketing, SEO, content, social media', 'megaphone', 3),
  ('Viết nội dung', 'viet-noi-dung', 'Viết bài, copywriting, biên dịch, sáng tạo nội dung', 'pencil', 4),
  ('Dịch thuật', 'dich-thuat', 'Dịch tài liệu, phiên dịch, localization', 'globe', 5),
  ('Video & Animation', 'video-animation', 'Dựng video, motion graphics, animation', 'film', 6),
  ('Nhập liệu & Admin', 'nhap-lieu-admin', 'Nhập liệu, data entry, trợ lý ảo', 'clipboard', 7),
  ('Tư vấn & Đào tạo', 'tu-van-dao-tao', 'Tư vấn chuyên môn, coaching, mentoring', 'users', 8),
  ('Kế toán & Tài chính', 'ke-toan-tai-chinh', 'Kế toán, thuế, tư vấn tài chính', 'calculator', 9),
  ('Khác', 'khac', 'Các công việc không thuộc danh mục trên', 'more-horizontal', 10)
ON CONFLICT (slug) DO NOTHING;
