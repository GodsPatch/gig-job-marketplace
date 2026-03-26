import { Request, Response } from 'express';
import { GetProfileUseCase } from '../../../application/use-cases/auth/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../../application/use-cases/auth/UpdateProfileUseCase';

/**
 * User Controller — handles HTTP requests for user profile endpoints.
 */
export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  /**
   * GET /api/v1/users/me
   * Returns the authenticated user's profile.
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const user = await this.getProfileUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  /**
   * PATCH /api/v1/users/me
   * Updates the authenticated user's profile.
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const user = await this.updateProfileUseCase.execute(userId, req.body);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
}
