/**
 * Refresh token record — represents a stored refresh token in the database.
 */
export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedBy: string | null;
  createdAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
}

/**
 * Data required to create a new refresh token record.
 */
export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Refresh Token repository interface — defines the contract for refresh token data access.
 *
 * This is a port in Clean Architecture. Implementation lives in infrastructure layer.
 */
export interface IRefreshTokenRepository {
  /**
   * Create a new refresh token record.
   */
  create(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;

  /**
   * Find a refresh token record by its hashed token value.
   */
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;

  /**
   * Revoke a specific refresh token by ID.
   * Optionally set the replacedBy field (for token rotation tracking).
   */
  revokeById(id: string, replacedById?: string): Promise<void>;

  /**
   * Revoke ALL refresh tokens for a specific user.
   * Used for token reuse detection (security) and complete logout.
   */
  revokeAllByUserId(userId: string): Promise<void>;

  /**
   * Delete expired tokens from the database (cleanup).
   * Returns the number of deleted records.
   */
  deleteExpired(): Promise<number>;
}
