export type ActionCode = 
  | 'profile_completed'
  | 'profile_updated'
  | 'job_published'
  | 'job_closed'
  | 'review_received_good'
  | 'review_received'
  | 'review_given'
  | 'daily_login'
  | 'skills_updated';

export const GamificationActions = {
  PROFILE_COMPLETED: 'profile_completed' as ActionCode,
  PROFILE_UPDATED: 'profile_updated' as ActionCode,
  JOB_PUBLISHED: 'job_published' as ActionCode,
  JOB_CLOSED: 'job_closed' as ActionCode,
  REVIEW_RECEIVED_GOOD: 'review_received_good' as ActionCode,
  REVIEW_RECEIVED: 'review_received' as ActionCode,
  REVIEW_GIVEN: 'review_given' as ActionCode,
  DAILY_LOGIN: 'daily_login' as ActionCode,
  SKILLS_UPDATED: 'skills_updated' as ActionCode,
} as const;

export const ActionPointsConfig: Record<ActionCode, { points: number, type: 'once' | 'daily' | 'unlimited' }> = {
  profile_completed: { points: 50, type: 'once' },
  profile_updated: { points: 5, type: 'daily' },
  job_published: { points: 20, type: 'unlimited' },
  job_closed: { points: 10, type: 'unlimited' },
  review_received_good: { points: 15, type: 'unlimited' },
  review_received: { points: 5, type: 'unlimited' },
  review_given: { points: 10, type: 'unlimited' },
  daily_login: { points: 3, type: 'daily' },
  skills_updated: { points: 10, type: 'once' },
};
