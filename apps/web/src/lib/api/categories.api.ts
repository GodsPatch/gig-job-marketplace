import { apiClient as api } from './client';
import { CategoryWithCount } from '../../types/job';

export const categoriesApi = {
  list: async (): Promise<CategoryWithCount[]> => {
    const response = await api.get<{ categories: CategoryWithCount[] }>('/api/v1/categories');
    return response.categories;
  },
  getBySlug: async (slug: string): Promise<CategoryWithCount> => {
    const response = await api.get<{ category: CategoryWithCount }>(`/api/v1/categories/${slug}`);
    return response.category;
  }
};
