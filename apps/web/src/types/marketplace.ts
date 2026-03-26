// ===== Worker Profile Types =====
export type AvailabilityType = 'available' | 'busy' | 'unavailable';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  categoryId?: string;
  categoryName?: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  title: string | null;
  hourlyRate: number | null;
  experienceYears: number | null;
  availability: AvailabilityType;
  portfolioUrl: string | null;
  isVisible: boolean;
  ratingAverage: number;
  ratingCount: number;
  jobsCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerProfileWithUser {
  profile: WorkerProfile;
  skills: Skill[];
  user?: {
    id: string;
    fullName: string;
    email?: string;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
  };
}

export interface WorkerCardData {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  title: string;
  bio: string | null;
  hourlyRate: number | null;
  experienceYears: number | null;
  availability: AvailabilityType;
  ratingAverage: number;
  ratingCount: number;
  jobsCompleted: number;
  skills: Skill[];
}

export interface UpdateWorkerProfileInput {
  title?: string;
  hourlyRate?: number;
  experienceYears?: number;
  availability?: AvailabilityType;
  portfolioUrl?: string | null;
  isVisible?: boolean;
}

export interface WorkerListFilters {
  keyword?: string;
  skillIds?: string;
  categoryId?: string;
  availability?: AvailabilityType;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  ratingMin?: number;
  experienceMin?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// ===== Review Types =====
export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewWithDetails {
  review: Review;
  reviewer: { id: string; fullName: string; avatarUrl: string | null; role: string };
  job: { id: string; title: string; slug: string };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface CreateReviewInput {
  revieweeId: string;
  rating: number;
  comment?: string;
}

// ===== Public Profile Types =====
export interface PublicProfileWorker {
  user: { id: string; fullName: string; avatarUrl: string | null; bio: string | null; role: string; createdAt: string };
  workerProfile: {
    title: string;
    hourlyRate: number | null;
    experienceYears: number | null;
    availability: AvailabilityType;
    portfolioUrl: string | null;
    ratingAverage: number;
    ratingCount: number;
    jobsCompleted: number;
    skills: Skill[];
  } | null;
  recentReviews: ReviewWithDetails[];
}

export interface PublicProfileEmployer {
  user: { id: string; fullName: string; avatarUrl: string | null; bio: string | null; role: string; createdAt: string };
  employerStats: {
    totalJobsPosted: number;
    activeJobs: number;
    ratingAverage: number;
    ratingCount: number;
  };
  recentReviews: ReviewWithDetails[];
}

export type PublicProfile = PublicProfileWorker | PublicProfileEmployer;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
