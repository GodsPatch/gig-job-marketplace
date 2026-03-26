ALTER TABLE jobs ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

CREATE INDEX idx_jobs_view_count ON jobs(view_count DESC);

CREATE INDEX idx_jobs_published_discovery
  ON jobs(status, published_at DESC, view_count DESC)
  WHERE status = 'published';

CREATE INDEX idx_jobs_title_search
  ON jobs USING gin(to_tsvector('simple', title))
  WHERE status = 'published';
