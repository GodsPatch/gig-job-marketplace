import { apiClient as api } from './client';
import { Skill } from '../../types/marketplace';

export const skillsApi = {
  list: async (): Promise<Skill[]> => {
    const response = await api.get<{ skills: Skill[] }>('/api/v1/skills');
    return response.skills;
  },
};
