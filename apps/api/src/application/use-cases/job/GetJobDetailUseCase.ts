import { IJobRepository } from '../../../domain/repositories/IJobRepository';
import { JobResponseDTO } from '../../dtos/JobDTOs';
import { JobNotFoundError } from '../../../domain/errors/JobErrors';

export class GetJobDetailUseCase {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(slug: string, userId: string | null, isAdmin: boolean = false): Promise<JobResponseDTO> {
    const job = await this.jobRepository.findBySlug(slug);
    
    if (!job) {
      throw new JobNotFoundError(slug);
    }

    // Increment logic: async unblocked execution
    if (job.isPublic() && (!userId || !job.isOwner(userId))) {
      this.jobRepository.incrementViewCount(job.id).catch(err => {
        console.error('Failed to increment view count', err);
      });
    }

    if (job.isPublic()) {
      return job as unknown as JobResponseDTO;
    }

    if (!userId) {
      throw new JobNotFoundError(slug); // Avoid 403 to prevent existence leak
    }

    if (job.isOwner(userId) || isAdmin) {
      return job as unknown as JobResponseDTO;
    }

    throw new JobNotFoundError(slug);
  }
}
