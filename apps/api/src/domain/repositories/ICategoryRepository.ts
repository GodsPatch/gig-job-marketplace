import { Category } from '../entities/Category';

export interface CategoryWithJobCount {
  category: Category;
  jobCount: number;
}

export interface ICategoryRepository {
  findAll(activeOnly?: boolean): Promise<Category[]>;
  findAllWithJobCount(): Promise<CategoryWithJobCount[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
}
