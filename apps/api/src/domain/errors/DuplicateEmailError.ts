import { DomainError } from './DomainError';

/**
 * Thrown when attempting to register with an email that already exists.
 */
export class DuplicateEmailError extends DomainError {
  constructor(email: string) {
    super(`Email already registered: ${email}`, 'DUPLICATE_EMAIL', 409);
  }
}
