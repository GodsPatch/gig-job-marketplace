import { IGamificationService, GamificationEvent, GamificationResult } from '../../application/services/GamificationService';
import { IPointRepository } from '../../domain/repositories/IPointRepository';
import { IAchievementRepository } from '../../domain/repositories/IAchievementRepository';
import { PointTransaction } from '../../domain/entities/PointTransaction';
import { ActionCode, ActionPointsConfig } from '../../domain/value-objects/ActionCode';
import { logger } from '../logging';

export class GamificationServiceImpl implements IGamificationService {
  constructor(
    private pointRepo: IPointRepository,
    private achievementRepo: IAchievementRepository,
  ) {}

  async handleEvent(event: GamificationEvent): Promise<GamificationResult> {
    try {
      const actionCode = event.type as ActionCode;
      const config = ActionPointsConfig[actionCode];

      if (!config) {
        return { pointsAwarded: 0, achievementsUnlocked: [] };
      }

      // Check one-time or daily limits
      if (config.type === 'once') {
        const hasEver = await this.pointRepo.hasActionEver(event.userId, actionCode);
        if (hasEver) return { pointsAwarded: 0, achievementsUnlocked: [] };
      } else if (config.type === 'daily') {
        const hasToday = await this.pointRepo.hasActionToday(event.userId, actionCode);
        if (hasToday) return { pointsAwarded: 0, achievementsUnlocked: [] };
      }

      // Check point daily cap
      const dailyTotal = await this.pointRepo.getDailyPointsTotal(event.userId, new Date());
      if (dailyTotal + config.points > 100) {
        logger.warn(`User ${event.userId} reached daily point cap`);
        return { pointsAwarded: 0, achievementsUnlocked: [] };
      }

      // Create Transaction
      const txId = crypto.randomUUID();
      const refId = event.data?.referenceId || null;
      const refType = event.data?.referenceType || null;

      const tx = new PointTransaction(
        txId,
        event.userId,
        actionCode,
        config.points,
        refId,
        refType,
        null, // metadata
        new Date()
      );

      await this.pointRepo.createTransaction(tx);
      await this.pointRepo.updateUserSummary(event.userId);

      // Evaluate Achievements
      const unlocked = [];
      const allDefs = await this.achievementRepo.findAllDefinitions(true);
      
      for (const def of allDefs) {
        const isUnlocked = await this.achievementRepo.isUnlocked(event.userId, def.id);
        if (!isUnlocked) {
          const progress = await this.achievementRepo.getProgress(event.userId, def);
          if (progress.current >= def.conditionThreshold) {
            await this.achievementRepo.unlockAchievement(event.userId, def.id);
            unlocked.push(def);
          }
        }
      }

      return { pointsAwarded: config.points, achievementsUnlocked: unlocked };
    } catch (error) {
      logger.error('Error in GamificationService handleEvent', { error });
      return { pointsAwarded: 0, achievementsUnlocked: [] };
    }
  }
}
