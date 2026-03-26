-- Migration: 009_create-worker-skills-table.sql
-- Junction table: worker ↔ skills (many-to-many)

CREATE TABLE IF NOT EXISTS worker_skills (
  worker_profile_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (worker_profile_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_skills_skill_id ON worker_skills(skill_id);
