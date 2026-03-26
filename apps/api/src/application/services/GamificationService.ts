import { Achievement } from '../../domain/entities/Achievement';

export interface GamificationResult {
  pointsAwarded: number;
  achievementsUnlocked: Achievement[];
}

export type GamificationEvent = {
  type: string;  // e.g., 'job.published', 'review.created', 'user.registered'
  userId: string;
  data?: Record<string, any>;
};

export interface IGamificationService {
  handleEvent(event: GamificationEvent): Promise<GamificationResult>;
}
