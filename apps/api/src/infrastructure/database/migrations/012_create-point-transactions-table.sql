CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_code VARCHAR(50) NOT NULL,
  points INT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_points_positive CHECK (points > 0)
);

CREATE INDEX idx_point_tx_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_tx_user_created ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_tx_action ON point_transactions(action_code);
CREATE INDEX idx_point_tx_created_at ON point_transactions(created_at);
-- Index cho leaderboard queries
CREATE INDEX idx_point_tx_weekly ON point_transactions(created_at, user_id);
