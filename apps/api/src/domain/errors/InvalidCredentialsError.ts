import { DomainError } from './DomainError';

/**
 * Thrown when login credentials are invalid.
 * Uses a generic message that does NOT reveal whether email or password was wrong.
 * This is a security best practice to prevent account enumeration.
 */
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS', 401);
  }
}
