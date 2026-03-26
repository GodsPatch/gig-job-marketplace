export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface AchievementProgress extends Achievement {
  progress?: {
    current: number;
    target: number;
  };
  unlockedAt?: string;
}

export interface ProgressData {
  points: {
    total: number;
    weekly: number;
    monthly: number;
  };
  rank: {
    weekly: { position: number | null; totalParticipants: number };
    monthly: { position: number | null; totalParticipants: number };
  };
  streak: {
    current: number;
    longest: number;
  };
  achievements: {
    unlocked: AchievementProgress[];
    locked: AchievementProgress[];
  };
}

export interface PointTransaction {
  id: string;
  actionCode: string;
  points: number;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  points: number;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
}

export interface LeaderboardData {
  cycle: {
    type: 'weekly' | 'monthly';
    startDate: string;
  };
  rankings: LeaderboardEntry[];
  currentUser: {
    rank: number | null;
    points: number;
  } | null;
  totalParticipants: number;
}
