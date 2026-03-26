import { apiClient as api } from './client';
import { WorkerCardData, WorkerProfileWithUser, UpdateWorkerProfileInput, WorkerListFilters, Skill, Pagination } from '../../types/marketplace';

export const workersApi = {
  getMyProfile: async (): Promise<WorkerProfileWithUser> => {
    const response = await api.get<{ profile: WorkerProfileWithUser['profile']; skills: Skill[] }>('/api/v1/workers/me/profile');
    return { profile: response.profile, skills: response.skills };
  },

  updateMyProfile: async (data: UpdateWorkerProfileInput): Promise<WorkerProfileWithUser['profile']> => {
    const response = await api.patch<{ profile: WorkerProfileWithUser['profile'] }>('/api/v1/workers/me/profile', data);
    return response.profile;
  },

  updateMySkills: async (skillIds: string[]): Promise<Skill[]> => {
    const response = await api.put<{ skills: Skill[] }>('/api/v1/workers/me/skills', { skillIds });
    return response.skills;
  },

  search: async (filters: WorkerListFilters): Promise<{ workers: WorkerCardData[]; pagination: Pagination }> => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.skillIds) params.append('skillIds', filters.skillIds);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.hourlyRateMin) params.append('hourlyRateMin', filters.hourlyRateMin.toString());
    if (filters.hourlyRateMax) params.append('hourlyRateMax', filters.hourlyRateMax.toString());
    if (filters.ratingMin) params.append('ratingMin', filters.ratingMin.toString());
    if (filters.experienceMin) params.append('experienceMin', filters.experienceMin.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return api.get<{ workers: WorkerCardData[]; pagination: Pagination }>(`/api/v1/workers?${params.toString()}`);
  },
};
