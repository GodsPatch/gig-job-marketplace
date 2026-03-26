import { apiClient as api } from './client';
import { PublicProfile } from '../../types/marketplace';

export const profilesApi = {
  getPublic: async (userId: string): Promise<PublicProfile> => {
    return api.get<PublicProfile>(`/api/v1/users/${userId}/profile`);
  },
};
