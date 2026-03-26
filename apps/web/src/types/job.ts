export type JobStatus = 'draft' | 'published' | 'closed';
export type BudgetType = 'fixed' | 'hourly' | 'negotiable';
export type LocationType = 'remote' | 'onsite' | 'hybrid';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
}

export interface CategoryWithCount extends Category {
  jobCount: number;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  locationType: LocationType;
  location: string | null;
  status: JobStatus;
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface CreateJobInput {
  title: string;
  description: string;
  categoryId: string;
  budgetType: BudgetType;
  budgetMin?: number | null;
  budgetMax?: number | null;
  locationType: LocationType;
  location?: string | null;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export interface JobListFilters {
  status?: JobStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PublicJobFilters {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  locationType?: LocationType;
  budgetType?: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  jobs: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
