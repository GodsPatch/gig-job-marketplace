import { DomainError } from './DomainError';

/**
 * Thrown when a user is not found by ID or other identifier.
 */
export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND', 404);
  }
}
