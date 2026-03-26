import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(30, 'Description must be at least 30 characters').max(5000),
  categoryId: z.string().uuid('Invalid category ID'),
  budgetType: z.enum(['fixed', 'hourly', 'negotiable']),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']),
  location: z.string().max(200).optional().nullable(),
}).refine(data => {
  if ((data.budgetType === 'fixed' || data.budgetType === 'hourly') && (data.budgetMin == null || data.budgetMax == null)) {
    return false;
  }
  return true;
}, { message: "Fixed and Hourly budgets require min and max values", path: ['budgetMin'] })
.refine(data => {
  if (data.budgetMin != null && data.budgetMax != null && data.budgetMin > data.budgetMax) {
    return false;
  }
  return true;
}, { message: "Budget min cannot be greater than max", path: ['budgetMin'] })
.refine(data => {
  if ((data.locationType === 'onsite' || data.locationType === 'hybrid') && (!data.location || data.location.trim() === '')) {
    return false;
  }
  return true;
}, { message: "Location is required for onsite and hybrid jobs", path: ['location'] });

export const updateJobSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(30).max(5000).optional(),
  categoryId: z.string().uuid().optional(),
  budgetType: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  location: z.string().max(200).optional().nullable(),
});

export const jobListQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'closed']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.string().optional()
});

export const publicSearchSchema = z.object({
  keyword: z.string().min(2).max(200).optional(),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  budgetType: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
  budgetMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  budgetMax: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(['newest', 'oldest', 'budget_desc', 'budget_asc', 'trending']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
}).refine(data => {
  if (data.budgetMin != null && data.budgetMax != null && data.budgetMin > data.budgetMax) {
    return false;
  }
  return true;
}, { message: "Budget min cannot be greater than max", path: ['budgetMin'] });
