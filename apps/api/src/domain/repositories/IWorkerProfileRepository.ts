import { WorkerProfile } from '../entities/WorkerProfile';

export interface WorkerListFilters {
  keyword?: string;
  skillIds?: string[];
  categoryId?: string;
  availability?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  ratingMin?: number;
  experienceMin?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface WorkerProfileWithUser {
  profile: WorkerProfile;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  skills: { id: string; name: string; slug: string }[];
}

export interface PaginatedWorkerResult {
  data: WorkerProfileWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWorkerProfileRepository {
  findByUserId(userId: string): Promise<WorkerProfile | null>;
  create(profile: WorkerProfile): Promise<WorkerProfile>;
  update(profile: WorkerProfile): Promise<WorkerProfile>;
  findVisible(filters: WorkerListFilters): Promise<PaginatedWorkerResult>;
  updateRating(userId: string, average: number, count: number): Promise<void>;
}
