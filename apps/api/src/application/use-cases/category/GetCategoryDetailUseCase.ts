import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryWithCountDTO } from '../../dtos/CategoryDTOs';

export class GetCategoryDetailUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(slug: string): Promise<CategoryWithCountDTO> {
    const categoriesWithCount = await this.categoryRepository.findAllWithJobCount();
    const found = categoriesWithCount.find(c => c.category.slug === slug);
    
    if (!found) {
      throw new Error(`Category not found with slug: ${slug}`);
    }

    return {
      ...found.category.toResponse(),
      jobCount: found.jobCount
    };
  }
}
