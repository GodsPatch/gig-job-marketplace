export class UserAchievement {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly achievementId: string,
    public readonly unlockedAt: Date = new Date(),
  ) {}
}
