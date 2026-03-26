import { IWorkerProfileRepository } from '../../../domain/repositories/IWorkerProfileRepository';
import { UpdateWorkerProfileProps } from '../../../domain/entities/WorkerProfile';
import { WorkerProfile } from '../../../domain/entities/WorkerProfile';
import { v4 as uuidv4 } from 'uuid';
import { IGamificationService } from '../../services/GamificationService';

export class UpdateWorkerProfileUseCase {
  constructor(
    private readonly workerProfileRepo: IWorkerProfileRepository,
    private readonly gamificationService?: IGamificationService
  ) {}

  async execute(userId: string, data: UpdateWorkerProfileProps) {
    let profile = await this.workerProfileRepo.findByUserId(userId);
    
    if (!profile) {
      // Auto-create then update
      profile = WorkerProfile.createEmpty(userId, uuidv4());
      profile = await this.workerProfileRepo.create(profile);
    }

    profile.update(data);
    const updated = await this.workerProfileRepo.update(profile);

    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'profile_updated',
        userId: userId,
      });
      if (updated.title && updated.hourlyRate !== null && updated.experienceYears !== null) {
        await this.gamificationService.handleEvent({
          type: 'profile_completed',
          userId: userId,
        });
      }
    }

    return updated;
  }
}
