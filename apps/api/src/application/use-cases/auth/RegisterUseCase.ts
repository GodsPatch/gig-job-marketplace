import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { IPasswordService } from '../../interfaces/IPasswordService';
import { ITokenService } from '../../interfaces/ITokenService';
import { IGamificationService } from '../../services/GamificationService';
import { RegisterDTO, AuthResponseDTO } from '../../dtos';
import { User } from '../../../domain/entities/User';
import { DuplicateEmailError } from '../../../domain/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * Register Use Case — handles user registration.
 *
 * Flow:
 * 1. Check email not already taken
 * 2. Hash password
 * 3. Create User entity
 * 4. Save to DB
 * 5. Generate access + refresh tokens
 * 6. Store refresh token hash in DB
 * 7. Return user + tokens
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly gamificationService?: IGamificationService
  ) {}

  async execute(
    dto: RegisterDTO,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDTO> {
    // 1. Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new DuplicateEmailError(dto.email);
    }

    // 2. Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // 3. Create User entity
    const user = User.create({
      id: uuidv4(),
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      role: dto.role || 'worker',
    });

    // 4. Save to DB
    const savedUser = await this.userRepository.create(user);

    // 5. Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });
    const refreshToken = this.tokenService.generateRefreshToken();

    // 6. Store refresh token hash in DB
    const refreshTokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create({
      userId: savedUser.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    if (this.gamificationService) {
      await this.gamificationService.handleEvent({
        type: 'user_registered',
        userId: savedUser.id,
      });
    }

    // 7. Return response
    return {
      user: savedUser.toResponse(),
      accessToken,
      refreshToken,
    };
  }
}
