import { AchievementTier } from '../value-objects/AchievementTier';

export class Achievement {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string,
    public readonly icon: string,
    public readonly tier: AchievementTier,
    public readonly conditionType: string,
    public readonly conditionThreshold: number,
    public readonly isActive: boolean = true,
    public readonly displayOrder: number = 0,
    public readonly pointsReward: number = 0,
    public readonly createdAt: Date = new Date(),
  ) {
    if (conditionThreshold <= 0) {
      throw new Error('Condition threshold must be positive');
    }
  }
}
