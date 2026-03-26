import { IJobRepository } from '../../../domain/repositories/IJobRepository';
import { JobResponseDTO } from '../../dtos/JobDTOs';
import { JobNotFoundError } from '../../../domain/errors/JobErrors';
import { IGamificationService } from '../../services/GamificationService';

export class PublishJobUseCase {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly gamificationService?: IGamificationService
  ) {}

  async execute(jobId: string, userId: string): Promise<JobResponseDTO> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new JobNotFoundError(jobId);
    }

    if (!job.isOwner(userId)) {
      throw new Error('You do not have permission to publish this job');
    }

    job.publish();

    await this.jobRepository.update(job);

    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'job_published',
        userId: userId,
        data: { referenceId: job.id, referenceType: 'job' }
      });
    }

    const populatedJob = await this.jobRepository.findById(job.id);
    return populatedJob as unknown as JobResponseDTO;
  }
}
