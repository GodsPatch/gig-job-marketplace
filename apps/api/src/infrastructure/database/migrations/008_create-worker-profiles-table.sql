-- Migration: 008_create-worker-profiles-table.sql
-- Worker profile (1-1 with users WHERE role='worker')

CREATE TABLE IF NOT EXISTS worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150),
  hourly_rate NUMERIC(10, 0),
  experience_years INT,
  availability VARCHAR(20) DEFAULT 'available',
  portfolio_url VARCHAR(500),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  jobs_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_availability CHECK (availability IN ('available', 'busy', 'unavailable')),
  CONSTRAINT chk_experience_years CHECK (experience_years IS NULL OR experience_years >= 0),
  CONSTRAINT chk_hourly_rate CHECK (hourly_rate IS NULL OR hourly_rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_is_visible ON worker_profiles(is_visible);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_availability ON worker_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_rating ON worker_profiles(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_hourly_rate ON worker_profiles(hourly_rate);
