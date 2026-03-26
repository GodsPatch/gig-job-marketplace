import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserNotFoundError } from '../../../domain/errors';
import { UpdateProfileDTO } from '../../dtos';
import { UserResponse } from '../../../domain/entities/User';

/**
 * Update Profile Use Case — updates the authenticated user's profile.
 *
 * Flow:
 * 1. Find current user
 * 2. Update allowed fields only (fullName, phoneNumber, avatarUrl, bio)
 * 3. Save changes
 * 4. Return updated user
 *
 * NOTE: email, password, role, status are NOT updatable here.
 */
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDTO): Promise<UserResponse> {
    // 1. Find existing user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // 2. Update profile (User entity enforces which fields can be updated)
    user.updateProfile({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
    });

    // 3. Save changes
    const updatedUser = await this.userRepository.update(user);

    // 4. Return updated user response
    return updatedUser.toResponse();
  }
}
