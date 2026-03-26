import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserNotFoundError } from '../../../domain/errors';
import { UserResponse } from '../../../domain/entities/User';

/**
 * Get Profile Use Case — retrieves the authenticated user's profile.
 *
 * Flow:
 * 1. Look up user by ID (from auth middleware)
 * 2. Return user data (without passwordHash)
 */
export class GetProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return user.toResponse();
  }
}
