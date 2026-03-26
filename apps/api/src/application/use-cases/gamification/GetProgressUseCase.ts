import { IPointRepository } from '../../../domain/repositories/IPointRepository';
import { IAchievementRepository } from '../../../domain/repositories/IAchievementRepository';
import { ProgressDTO } from '../../dtos/gamification/ProgressDTO';

export class GetProgressUseCase {
  constructor(
    private pointRepo: IPointRepository,
    private achievementRepo: IAchievementRepository,
  ) {}

  async execute(userId: string): Promise<ProgressDTO> {
    const totalPoints = await this.pointRepo.getUserTotalPoints(userId);
    const weeklyPoints = await this.pointRepo.getUserCyclePoints(userId, 'weekly');
    const monthlyPoints = await this.pointRepo.getUserCyclePoints(userId, 'monthly');

    const weeklyRank = await this.pointRepo.getUserRank(userId, 'weekly');
    const monthlyRank = await this.pointRepo.getUserRank(userId, 'monthly');

    // Retrieve active definitions and user unlocked achievements
    const allDefs = await this.achievementRepo.findAllDefinitions(true);
    const unlockedList = await this.achievementRepo.findUnlockedByUser(userId);
    const unlockedIds = new Set(unlockedList.map((a) => a.id));

    const unlocked = [];
    const locked = [];

    for (const def of allDefs) {
      if (unlockedIds.has(def.id)) {
        // find unlockedAt
        const userAchi = await this.achievementRepo.findUserAchievements(userId);
        const match = userAchi.find((ua) => ua.achievementId === def.id);
        unlocked.push({
          id: def.id,
          code: def.code,
          name: def.name,
          description: def.description,
          icon: def.icon,
          tier: def.tier,
          unlockedAt: match ? match.unlockedAt : new Date(),
        });
      } else {
        const progress = await this.achievementRepo.getProgress(userId, def);
        locked.push({
          id: def.id,
          code: def.code,
          name: def.name,
          description: def.description,
          icon: def.icon,
          tier: def.tier,
          progress,
        });
      }
    }

    // Get streak info from summary. In a real impl, we should fetch from summary table.
    // Assuming pointRepo has a method or we'll add one. 
    // For now we mock the streak portion or use a DB query.
    return {
      points: {
        total: totalPoints,
        weekly: weeklyPoints,
        monthly: monthlyPoints,
      },
      rank: {
        weekly: {
          position: weeklyRank?.rank ?? null,
          totalParticipants: weeklyRank?.totalParticipants ?? 0,
        },
        monthly: {
          position: monthlyRank?.rank ?? null,
          totalParticipants: monthlyRank?.totalParticipants ?? 0,
        },
      },
      streak: {
        current: 0, // Placeholder, would come from user_points_summary
        longest: 0,
      },
      achievements: {
        unlocked,
        locked,
      },
    };
  }
}
