import { apiClient as api } from './client';
import { ReviewWithDetails, ReviewSummary, CreateReviewInput, Pagination } from '../../types/marketplace';

export const reviewsApi = {
  create: async (jobId: string, data: CreateReviewInput): Promise<any> => {
    return api.post(`/api/v1/jobs/${jobId}/reviews`, data);
  },

  listByJob: async (jobId: string): Promise<{ reviews: ReviewWithDetails[] }> => {
    return api.get<{ reviews: ReviewWithDetails[] }>(`/api/v1/jobs/${jobId}/reviews`);
  },

  listByUser: async (userId: string, filters?: { page?: number; limit?: number; sort?: string }): Promise<{
    data: ReviewWithDetails[];
    summary: ReviewSummary;
    pagination: Pagination;
  }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    
    return api.get(`/api/v1/users/${userId}/reviews?${params.toString()}`);
  },
};
