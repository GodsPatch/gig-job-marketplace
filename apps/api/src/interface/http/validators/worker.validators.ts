import { z } from 'zod';

export const updateWorkerProfileSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  hourlyRate: z.number().int().positive().max(50000000).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  portfolioUrl: z.string().url().max(500).optional().nullable(),
  isVisible: z.boolean().optional(),
});

export const updateWorkerSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid()).max(15),
});

export const workerListQuerySchema = z.object({
  keyword: z.string().min(2).max(200).optional(),
  skillIds: z.string().optional(), // comma-separated
  categoryId: z.string().uuid().optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  hourlyRateMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  hourlyRateMax: z.string().regex(/^\d+$/).transform(Number).optional(),
  ratingMin: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  experienceMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(['rating_desc', 'experience_desc', 'hourly_rate_asc', 'hourly_rate_desc', 'newest']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
