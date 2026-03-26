import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryWithCountDTO } from '../../dtos/CategoryDTOs';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<CategoryWithCountDTO[]> {
    const categories = await this.categoryRepository.findAllWithJobCount();
    
    return categories.map(c => ({
      ...c.category.toResponse(),
      jobCount: c.jobCount
    }));
  }
}
