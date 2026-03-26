import { Job } from '../entities/Job';

// Adjust Pagination interface based on shared types logic
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicJobFilters {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  locationType?: 'remote' | 'onsite' | 'hybrid';
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  sort: 'newest' | 'oldest' | 'budget_desc' | 'budget_asc' | 'trending';
  page: number;
  limit: number;
}

export interface JobListFilters {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IJobRepository {
  create(job: Job): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findBySlug(slug: string): Promise<Job | null>;
  update(job: Job): Promise<Job>;
  findByOwner(userId: string, filters: JobListFilters): Promise<PaginatedResult<Job>>;
  existsBySlug(slug: string): Promise<boolean>;
  findPublished(filters: PublicJobFilters): Promise<PaginatedResult<Job>>;
  incrementViewCount(jobId: string): Promise<void>;
}
