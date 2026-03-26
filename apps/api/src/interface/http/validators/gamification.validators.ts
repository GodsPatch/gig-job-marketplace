import { z } from 'zod';

export const getPointHistorySchema = {
  query: z.object({
    page: z.string().optional().transform(v => (v ? parseInt(v, 10) : 1)).pipe(z.number().min(1)),
    limit: z.string().optional().transform(v => (v ? parseInt(v, 10) : 20)).pipe(z.number().min(1).max(50)),
  }),
};

export const getLeaderboardSchema = {
  query: z.object({
    cycle: z.enum(['weekly', 'monthly']).optional().default('weekly'),
  }),
};
