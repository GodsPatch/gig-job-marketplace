import { IJobRepository, JobListFilters } from '../../../domain/repositories/IJobRepository';
import { JobResponseDTO } from '../../dtos/JobDTOs';
import { PaginatedResult } from '../../../domain/repositories/IJobRepository';

export class ListOwnerJobsUseCase {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(userId: string, filters: JobListFilters): Promise<PaginatedResult<JobResponseDTO>> {
    const defaultFilters: JobListFilters = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sort: filters.sort || 'createdAt:desc',
      status: filters.status
    };

    const paginatedJobs = await this.jobRepository.findByOwner(userId, defaultFilters);

    // Ensure mapping to DTOs in a real scenario
    return paginatedJobs as unknown as PaginatedResult<JobResponseDTO>;
  }
}
