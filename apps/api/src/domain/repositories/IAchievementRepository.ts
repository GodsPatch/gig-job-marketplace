import { Achievement } from '../entities/Achievement';
import { UserAchievement } from '../entities/UserAchievement';

export interface IAchievementRepository {
  findAllDefinitions(activeOnly?: boolean): Promise<Achievement[]>;
  findUserAchievements(userId: string): Promise<UserAchievement[]>;
  findUnlockedByUser(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  isUnlocked(userId: string, achievementId: string): Promise<boolean>;
  getProgress(userId: string, achievement: Achievement): Promise<{ current: number; target: number }>;
}
