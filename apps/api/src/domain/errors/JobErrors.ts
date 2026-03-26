import { DomainError } from './DomainError';

export class InvalidStateTransitionError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_STATE_TRANSITION');
  }
}

export class JobNotFoundError extends DomainError {
  constructor(idOrSlug: string) {
    super(`Job with identifier ${idOrSlug} not found`, 'JOB_NOT_FOUND', 404);
  }
}

export class JobNotEditableError extends DomainError {
  constructor(message: string = 'Job is not in draft state and cannot be edited') {
    super(message, 'JOB_NOT_EDITABLE', 400);
  }
}

export class JobNotPublishableError extends DomainError {
  public details: { field: string; message: string }[];
  
  constructor(details: { field: string; message: string }[]) {
    super('Job is missing required fields and cannot be published', 'JOB_NOT_PUBLISHABLE', 400);
    this.details = details;
  }
}

export class JobNotClosableError extends DomainError {
  constructor(message: string = 'Job cannot be closed') {
    super(message, 'JOB_NOT_CLOSABLE', 400);
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(categoryId: string) {
    super(`Category ${categoryId} not found`, 'CATEGORY_NOT_FOUND', 404);
  }
}
