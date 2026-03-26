import { z } from 'zod';

/**
 * User validation schemas — Zod schemas for profile endpoints.
 */

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^[+]?[\d\s-()]{7,20}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'URL must not exceed 500 characters')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
    .nullable(),
});
