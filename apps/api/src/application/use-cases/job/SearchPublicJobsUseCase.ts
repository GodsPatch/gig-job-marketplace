import { IJobRepository, PublicJobFilters } from '../../../domain/repositories/IJobRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { JobResponseDTO, PublicJobFiltersDTO } from '../../dtos/JobDTOs';

export class SearchPublicJobsUseCase {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(filters: PublicJobFiltersDTO): Promise<{
    data: JobResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    filters: PublicJobFiltersDTO
  }> {
    
    let categoryId = filters.categoryId;
    if (!categoryId && filters.categorySlug) {
      const cat = await this.categoryRepository.findBySlug(filters.categorySlug);
      if (cat) categoryId = cat.id;
    }

    const domainFilters: PublicJobFilters = {
      keyword: filters.keyword,
      categoryId,
      locationType: filters.locationType as any,
      budgetType: filters.budgetType as any,
      budgetMin: filters.budgetMin,
      budgetMax: filters.budgetMax,
      sort: (filters.sort || 'newest') as any,
      page: filters.page || 1,
      limit: filters.limit || 12,
    };

    const result = await this.jobRepository.findPublished(domainFilters);
    
    return {
      data: result.data as unknown as JobResponseDTO[],
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      filters: filters
    };
  }
}
