import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IPasswordService } from '../../interfaces/IPasswordService';
import { ITokenService } from '../../interfaces/ITokenService';
import { IGamificationService } from '../../services/GamificationService';
import { IPointRepository } from '../../../domain/repositories/IPointRepository';
import { LoginDTO, AuthResponseDTO } from '../../dtos';
import { InvalidCredentialsError } from '../../../domain/errors';

/**
 * Login Use Case — handles user authentication.
 *
 * Flow:
 * 1. Find user by email
 * 2. Check account is active
 * 3. Verify password
 * 4. Generate tokens
 * 5. Store refresh token
 * 6. Return user + tokens
 *
 * SECURITY: Uses same error message for "user not found" and "wrong password"
 * to prevent account enumeration.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly gamificationService?: IGamificationService,
    private readonly pointRepo?: IPointRepository
  ) {}

  async execute(
    dto: LoginDTO,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDTO> {
    // 1. Find user by email — same error for "not found" (security)
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Check account is active
    if (!user.isActive()) {
      throw new InvalidCredentialsError();
    }

    // 3. Verify password — same error for "wrong password" (security)
    const isPasswordValid = await this.passwordService.verify(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 4. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.tokenService.generateRefreshToken();

    // 5. Store refresh token hash in DB
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    if (this.pointRepo) {
      await this.pointRepo.updateLoginStreak(user.id);
    }
    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'daily_login',
        userId: user.id
      });
    }

    // 6. Return response
    return {
      user: user.toResponse(),
      accessToken,
      refreshToken,
    };
  }
}
