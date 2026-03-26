import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { ITokenService } from '../../interfaces/ITokenService';

/**
 * Logout Use Case — invalidates refresh token.
 *
 * Flow:
 * 1. Hash the refresh token from cookie
 * 2. Find and revoke it in DB
 * 3. Always return success (even if token not found — avoid info leak)
 */
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      // No token provided — nothing to revoke, but still succeed
      return;
    }

    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (storedToken && !storedToken.isRevoked) {
      await this.refreshTokenRepository.revokeById(storedToken.id);
    }

    // Always succeed — don't reveal whether token was valid
  }
}
