import { IPointRepository } from '../../../domain/repositories/IPointRepository';
import { LeaderboardDTO } from '../../dtos/gamification/LeaderboardDTO';

function getCycleRange(cycle: 'weekly' | 'monthly'): { start: Date } {
  const now = new Date();
  if (cycle === 'weekly') {
    const day = now.getDay() || 7;
    if (day !== 1) now.setHours(-24 * (day - 1));
    now.setHours(0, 0, 0, 0);
  } else {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
  }
  return { start: now };
}

export class GetLeaderboardUseCase {
  constructor(private pointRepo: IPointRepository) {}

  async execute(
    cycle: 'weekly' | 'monthly',
    userId?: string
  ): Promise<LeaderboardDTO> {
    const range = getCycleRange(cycle);
    
    const rankings = await this.pointRepo.getLeaderboard(cycle, 20);
    
    let currentUser = null;
    let totalParticipants = 0;
    
    if (userId) {
      const userRankInfo = await this.pointRepo.getUserRank(userId, cycle);
      if (userRankInfo) {
        currentUser = {
          rank: userRankInfo.rank,
          points: await this.pointRepo.getUserCyclePoints(userId, cycle),
        };
        totalParticipants = userRankInfo.totalParticipants;
      }
    }

    return {
      cycle: {
        type: cycle,
        startDate: range.start.toISOString().split('T')[0] as string,
      },
      rankings,
      currentUser,
      totalParticipants: totalParticipants || rankings.length,
    };
  }
}
