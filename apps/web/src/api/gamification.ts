import { apiClient } from '../lib/api/client';
import { ProgressData, PointTransaction, LeaderboardData, Achievement } from '../types/gamification';

export const gamificationApi = {
  getProgress: async (): Promise<ProgressData> => {
    return apiClient.get<ProgressData>('/api/v1/gamification/me');
  },

  getPointHistory: async (params: { page?: number; limit?: number }): Promise<{ transactions: PointTransaction[]; pagination: any }> => {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page.toString());
    if (params.limit) urlParams.append('limit', params.limit.toString());
    
    const queryString = urlParams.toString();
    const endpoint = queryString ? `/api/v1/gamification/me/points?${queryString}` : '/api/v1/gamification/me/points';
    
    return apiClient.get<{ transactions: PointTransaction[]; pagination: any }>(endpoint);
  },

  getLeaderboard: async (cycle: 'weekly' | 'monthly' = 'weekly'): Promise<LeaderboardData> => {
    return apiClient.get<LeaderboardData>(`/api/v1/gamification/leaderboard?cycle=${cycle}`);
  },

  getAchievements: async (): Promise<{ achievements: Achievement[] }> => {
    return apiClient.get<{ achievements: Achievement[] }>('/api/v1/gamification/achievements');
  },
};
