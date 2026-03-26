import { apiClient as api } from './client';
import { Job, CreateJobInput, UpdateJobInput, JobListFilters, PaginatedResult, PublicJobFilters } from '../../types/job';

export const jobsApi = {
  create: async (data: CreateJobInput): Promise<Job> => {
    const response = await api.post<{ job: Job }>('/api/v1/jobs', data);
    return response.job;
  },

  update: async (id: string, data: UpdateJobInput): Promise<Job> => {
    const response = await api.patch<{ job: Job }>(`/api/v1/jobs/${id}`, data);
    return response.job;
  },

  publish: async (id: string): Promise<Job> => {
    const response = await api.post<{ job: Job }>(`/api/v1/jobs/${id}/publish`);
    return response.job;
  },

  close: async (id: string): Promise<Job> => {
    const response = await api.post<{ job: Job }>(`/api/v1/jobs/${id}/close`);
    return response.job;
  },

  getBySlug: async (slug: string): Promise<Job> => {
    const response = await api.get<{ job: Job }>(`/api/v1/jobs/${slug}`);
    return response.job;
  },

  listOwn: async (filters: JobListFilters): Promise<PaginatedResult<Job>> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get<PaginatedResult<Job>>(`/api/v1/jobs/me?${params.toString()}`);
    return response;
  },

  searchPublic: async (filters: PublicJobFilters): Promise<PaginatedResult<Job> & { filters: PublicJobFilters }> => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
    if (filters.locationType) params.append('locationType', filters.locationType);
    if (filters.budgetType) params.append('budgetType', filters.budgetType);
    if (filters.budgetMin) params.append('budgetMin', filters.budgetMin.toString());
    if (filters.budgetMax) params.append('budgetMax', filters.budgetMax.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResult<Job> & { filters: PublicJobFilters }>(`/api/v1/jobs/public?${params.toString()}`);
    return response;
  },
};
