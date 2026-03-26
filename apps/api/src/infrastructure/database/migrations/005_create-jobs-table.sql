-- Up Migration
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  budget_type VARCHAR(20) NOT NULL DEFAULT 'negotiable',
  budget_min NUMERIC(15, 0),
  budget_max NUMERIC(15, 0),
  location_type VARCHAR(20) NOT NULL DEFAULT 'remote',
  location VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_job_status CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT chk_budget_type CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  CONSTRAINT chk_location_type CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  CONSTRAINT chk_budget_range CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);

CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_category_id ON jobs(category_id);
CREATE INDEX idx_jobs_published_at ON jobs(published_at DESC);
CREATE INDEX idx_jobs_status_published_at ON jobs(status, published_at DESC);

-- Down Migration
DROP INDEX IF EXISTS idx_jobs_status_published_at;
DROP INDEX IF EXISTS idx_jobs_published_at;
DROP INDEX IF EXISTS idx_jobs_category_id;
DROP INDEX IF EXISTS idx_jobs_created_by;
DROP INDEX IF EXISTS idx_jobs_status;
DROP INDEX IF EXISTS idx_jobs_slug;
DROP TABLE IF EXISTS jobs;
