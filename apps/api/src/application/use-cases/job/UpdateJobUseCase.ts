import { IJobRepository } from '../../../domain/repositories/IJobRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { UpdateJobDTO, JobResponseDTO } from '../../dtos/JobDTOs';
import { JobNotFoundError } from '../../../domain/errors/JobErrors';
import { BudgetType } from '../../../domain/value-objects/BudgetType';
import { LocationType } from '../../../domain/value-objects/LocationType';

export class UpdateJobUseCase {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(jobId: string, dto: UpdateJobDTO, userId: string): Promise<JobResponseDTO> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new JobNotFoundError(jobId);
    }

    if (!job.isOwner(userId)) {
      throw new Error('You do not have permission to edit this job');
    }

    if (dto.categoryId && dto.categoryId !== job.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || !category.isActive) throw new Error(`Category ${dto.categoryId} not found or inactive`);
    }

    const budgetType = dto.budgetType ? BudgetType.fromString(dto.budgetType) : undefined;
    const locationType = dto.locationType ? LocationType.fromString(dto.locationType) : undefined;

    job.updateDraft({
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      budgetType,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      locationType,
      location: dto.location
    });

    // Validate budget/location logic after update
    if (job.budgetType.requiresBudgetRange()) {
      if (job.budgetMin == null || job.budgetMax == null) throw new Error('Requires min and max budget');
      if (job.budgetMin > job.budgetMax) throw new Error('Min > Max');
    }
    if (job.locationType.requiresLocationDetails() && (!job.location || job.location.trim().length === 0)) {
      throw new Error('Location is required');
    }

    await this.jobRepository.update(job);

    const populatedJob = await this.jobRepository.findById(job.id);
    return populatedJob as unknown as JobResponseDTO;
  }
}
