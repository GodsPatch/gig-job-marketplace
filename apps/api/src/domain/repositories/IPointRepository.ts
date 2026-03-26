import { PointTransaction } from '../entities/PointTransaction';

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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPointRepository {
  createTransaction(tx: PointTransaction): Promise<PointTransaction>;
  getUserTotalPoints(userId: string): Promise<number>;
  getUserCyclePoints(userId: string, cycle: 'weekly' | 'monthly'): Promise<number>;
  getPointHistory(userId: string, page: number, limit: number): Promise<PaginatedResult<PointTransaction>>;
  getDailyPointsTotal(userId: string, date: Date): Promise<number>;
  hasActionToday(userId: string, actionCode: string): Promise<boolean>;
  hasActionEver(userId: string, actionCode: string, referenceId?: string): Promise<boolean>;
  getLeaderboard(cycle: 'weekly' | 'monthly', limit: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: string, cycle: 'weekly' | 'monthly'): Promise<{ rank: number; totalParticipants: number } | null>;
  updateUserSummary(userId: string): Promise<void>;
  updateLoginStreak(userId: string): Promise<void>;
}
