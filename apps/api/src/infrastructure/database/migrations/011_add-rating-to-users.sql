-- Migration: 011_add-rating-to-users.sql
-- Employer rating cache on users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating_count INT NOT NULL DEFAULT 0;
