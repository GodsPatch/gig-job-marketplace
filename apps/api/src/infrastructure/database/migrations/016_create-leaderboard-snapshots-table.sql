CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_type VARCHAR(10) NOT NULL,
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  rank INT NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_cycle_type CHECK (cycle_type IN ('weekly', 'monthly')),
  CONSTRAINT uq_snapshot UNIQUE (cycle_type, cycle_start, user_id)
);

CREATE INDEX idx_leaderboard_cycle ON leaderboard_snapshots(cycle_type, cycle_start, rank);
