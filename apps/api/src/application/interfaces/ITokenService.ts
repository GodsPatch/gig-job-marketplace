/**
 * Token service interface — port for JWT and refresh token operations.
 *
 * Separates token generation/verification (infrastructure concern) from
 * application logic.
 */

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ITokenService {
  /**
   * Generate a signed JWT access token.
   * @returns JWT string
   */
  generateAccessToken(payload: AccessTokenPayload): string;

  /**
   * Generate a random refresh token string.
   * Uses crypto.randomBytes for cryptographic security.
   * @returns Random hex string
   */
  generateRefreshToken(): string;

  /**
   * Verify and decode an access token.
   * @returns Decoded payload or throws if invalid/expired
   */
  verifyAccessToken(token: string): AccessTokenPayload;

  /**
   * Hash a refresh token for storage.
   * Uses SHA-256 — we never store plaintext refresh tokens.
   * @returns SHA-256 hash of the token
   */
  hashRefreshToken(token: string): string;
}
