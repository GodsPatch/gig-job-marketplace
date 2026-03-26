import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { ITokenService } from '../../interfaces/ITokenService';
import { DomainError } from '../../../domain/errors';
import { logger } from '../../../infrastructure/logging';

/**
 * Unauthorized domain error for refresh token operations.
 */
class RefreshTokenError extends DomainError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * Refresh Token Use Case — handles token refresh with rotation + reuse detection.
 *
 * Flow:
 * 1. Hash incoming refresh token, look up in DB
 * 2. If not found → reject
 * 3. If revoked → TOKEN REUSE DETECTED → revoke ALL user tokens (security)
 * 4. If expired → reject
 * 5. Revoke old token
 * 6. Generate new refresh token, store in DB
 * 7. Generate new access token
 * 8. Return new tokens
 *
 * SECURITY: Token reuse detection protects against stolen refresh tokens.
 * If a revoked token is reused, ALL tokens for that user are revoked.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    refreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Hash token and look up in DB
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new RefreshTokenError('Invalid refresh token');
    }

    // 2. TOKEN REUSE DETECTION — if token is already revoked, it's been stolen
    if (storedToken.isRevoked) {
      logger.warn('Refresh token reuse detected! Revoking all tokens for user.', {
        userId: storedToken.userId,
        tokenId: storedToken.id,
      });
      // Revoke ALL tokens for this user — nuclear option for security
      await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
      throw new RefreshTokenError('Token reuse detected. All sessions have been revoked.');
    }

    // 3. Check if token has expired
    if (new Date() > storedToken.expiresAt) {
      // Revoke expired token
      await this.refreshTokenRepository.revokeById(storedToken.id);
      throw new RefreshTokenError('Refresh token has expired');
    }

    // 4. Fetch the user to verify they still exist and are active
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.isActive()) {
      await this.refreshTokenRepository.revokeById(storedToken.id);
      throw new RefreshTokenError('User account is not active');
    }

    // 5. Generate new refresh token
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newTokenHash = this.tokenService.hashRefreshToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const newTokenRecord = await this.refreshTokenRepository.create({
      userId: storedToken.userId,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    // 6. Revoke old token and link to new one (rotation)
    await this.refreshTokenRepository.revokeById(storedToken.id, newTokenRecord.id);

    // 7. Generate new access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
