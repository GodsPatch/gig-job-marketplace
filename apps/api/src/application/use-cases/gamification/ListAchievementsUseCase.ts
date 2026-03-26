import { IAchievementRepository } from '../../../domain/repositories/IAchievementRepository';

export class ListAchievementsUseCase {
  constructor(private achievementRepo: IAchievementRepository) {}

  async execute() {
    const achievements = await this.achievementRepo.findAllDefinitions(true);
    return achievements.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      tier: a.tier,
    }));
  }
}
