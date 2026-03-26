import { IWorkerProfileRepository } from '../../../domain/repositories/IWorkerProfileRepository';
import { ISkillRepository } from '../../../domain/repositories/ISkillRepository';
import { SkillLimitExceededError } from '../../../domain/errors/M5Errors';
import { WorkerProfile } from '../../../domain/entities/WorkerProfile';
import { v4 as uuidv4 } from 'uuid';
import { IGamificationService } from '../../services/GamificationService';

export class UpdateWorkerSkillsUseCase {
  constructor(
    private readonly workerProfileRepo: IWorkerProfileRepository,
    private readonly skillRepo: ISkillRepository,
    private readonly gamificationService?: IGamificationService
  ) {}

  async execute(userId: string, skillIds: string[]) {
    if (skillIds.length > 15) {
      throw new SkillLimitExceededError();
    }

    let profile = await this.workerProfileRepo.findByUserId(userId);
    if (!profile) {
      profile = WorkerProfile.createEmpty(userId, uuidv4());
      profile = await this.workerProfileRepo.create(profile);
    }

    // Validate all skill IDs exist and are active
    if (skillIds.length > 0) {
      const skills = await this.skillRepo.findByIds(skillIds);
      const activeSkills = skills.filter(s => s.isActive);
      if (activeSkills.length !== skillIds.length) {
        throw new Error('Some skill IDs are invalid or inactive');
      }
    }

    await this.skillRepo.setWorkerSkills(profile.id, skillIds);

    const updatedSkills = await this.skillRepo.findByWorkerProfileId(profile.id);

    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'skills_updated',
        userId: userId,
      });
    }

    return updatedSkills;
  }
}
