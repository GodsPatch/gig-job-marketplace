export type AchievementTier = 'bronze' | 'silver' | 'gold';

export const ACHIEVEMENT_TIERS = {
  BRONZE: 'bronze' as AchievementTier,
  SILVER: 'silver' as AchievementTier,
  GOLD: 'gold' as AchievementTier,
} as const;
