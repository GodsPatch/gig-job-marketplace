import { IWorkerProfileRepository, WorkerListFilters } from '../../../domain/repositories/IWorkerProfileRepository';

export class SearchWorkersUseCase {
  constructor(private readonly workerProfileRepo: IWorkerProfileRepository) {}

  async execute(filters: WorkerListFilters) {
    const sanitized: WorkerListFilters = {
      keyword: filters.keyword?.trim(),
      skillIds: filters.skillIds,
      categoryId: filters.categoryId,
      availability: filters.availability,
      hourlyRateMin: filters.hourlyRateMin,
      hourlyRateMax: filters.hourlyRateMax,
      ratingMin: filters.ratingMin,
      experienceMin: filters.experienceMin,
      sort: filters.sort || 'rating_desc',
      page: filters.page || 1,
      limit: Math.min(filters.limit || 12, 50),
    };

    return this.workerProfileRepo.findVisible(sanitized);
  }
}
