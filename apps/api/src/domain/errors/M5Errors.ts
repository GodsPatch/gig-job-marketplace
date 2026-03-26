import { DomainError } from './DomainError';

export class WorkerProfileNotFoundError extends DomainError {
  constructor() {
    super('Worker profile not found', 'WORKER_PROFILE_NOT_FOUND', 404);
  }
}

export class ReviewNotAllowedError extends DomainError {
  constructor(reason: string) {
    super(`Review not allowed: ${reason}`, 'REVIEW_NOT_ALLOWED', 400);
  }
}

export class DuplicateReviewError extends DomainError {
  constructor() {
    super('You have already reviewed for this job', 'DUPLICATE_REVIEW', 409);
  }
}

export class JobNotClosedError extends DomainError {
  constructor() {
    super('Job must be closed before reviewing', 'JOB_NOT_CLOSED', 400);
  }
}

export class SkillLimitExceededError extends DomainError {
  constructor() {
    super('Maximum 15 skills allowed', 'SKILL_LIMIT_EXCEEDED', 400);
  }
}
