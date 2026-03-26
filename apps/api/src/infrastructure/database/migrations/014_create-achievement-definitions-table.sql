CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  tier VARCHAR(10) NOT NULL,
  condition_type VARCHAR(50) NOT NULL,
  condition_threshold INT NOT NULL,
  condition_query TEXT,
  points_reward INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_tier CHECK (tier IN ('bronze', 'silver', 'gold')),
  CONSTRAINT chk_threshold CHECK (condition_threshold > 0)
);

CREATE INDEX idx_achievement_def_code ON achievement_definitions(code);
CREATE INDEX idx_achievement_def_active ON achievement_definitions(is_active);
