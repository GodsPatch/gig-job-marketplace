import { IWorkerProfileRepository } from '../../../domain/repositories/IWorkerProfileRepository';
import { ISkillRepository } from '../../../domain/repositories/ISkillRepository';
import { WorkerProfile } from '../../../domain/entities/WorkerProfile';
import { v4 as uuidv4 } from 'uuid';

export class GetMyWorkerProfileUseCase {
  constructor(
    private readonly workerProfileRepo: IWorkerProfileRepository,
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(userId: string) {
    let profile = await this.workerProfileRepo.findByUserId(userId);
    
    // Auto-create if not exists
    if (!profile) {
      profile = WorkerProfile.createEmpty(userId, uuidv4());
      profile = await this.workerProfileRepo.create(profile);
    }

    const skills = await this.skillRepo.findByWorkerProfileId(profile.id);

    return { profile, skills };
  }
}
