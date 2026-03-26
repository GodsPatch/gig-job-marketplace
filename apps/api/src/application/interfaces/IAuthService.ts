/**
 * Auth service interface — port for authentication operations.
 *
 * This interface defines the contract that the infrastructure layer
 * must implement to provide authentication functionality.
 *
 * TODO M2: Implement this interface with JWT token management.
 */
export interface IAuthService {
  /**
   * Hash a plain text password.
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verify a plain text password against a hash.
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /**
   * Generate an access token for a user.
   */
  generateAccessToken(userId: string, role: string): string;

  /**
   * Generate a refresh token for a user.
   */
  generateRefreshToken(userId: string): string;

  /**
   * Verify and decode an access token.
   */
  verifyAccessToken(token: string): { userId: string; role: string } | null;

  /**
   * Verify and decode a refresh token.
   */
  verifyRefreshToken(token: string): { userId: string } | null;
}
