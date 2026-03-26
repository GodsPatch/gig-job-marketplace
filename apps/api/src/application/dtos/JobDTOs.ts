import { CategoryResponseDTO } from './CategoryDTOs';

export interface CreateJobDTO {
  title: string;
  description: string;
  categoryId: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number | null;
  budgetMax?: number | null;
  locationType: 'remote' | 'onsite' | 'hybrid';
  location?: string | null;
  // createdBy will be injected by the controller from req.user
}

export interface UpdateJobDTO {
  title?: string;
  description?: string;
  categoryId?: string;
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number | null;
  budgetMax?: number | null;
  locationType?: 'remote' | 'onsite' | 'hybrid';
  location?: string | null;
}

export interface JobListFiltersDTO {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PublicJobFiltersDTO {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  locationType?: 'remote' | 'onsite' | 'hybrid';
  budgetType?: 'fixed' | 'hourly' | 'negotiable';
  budgetMin?: number;
  budgetMax?: number;
  sort?: 'newest' | 'oldest' | 'budget_desc' | 'budget_asc' | 'trending';
  page?: number;
  limit?: number;
}

export interface JobResponseDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryResponseDTO;
  budgetType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  locationType: string;
  location: string | null;
  status: string;
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  publishedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}
