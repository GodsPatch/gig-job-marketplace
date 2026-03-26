import { Request, Response } from 'express';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';


// Cookie name for refresh token
const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Cookie options for refresh token
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

/**
 * Auth Controller — handles HTTP requests for authentication endpoints.
 * Each method delegates to use cases and handles HTTP-specific concerns
 * (cookies, status codes, response formatting).
 */
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    const result = await this.registerUseCase.execute(req.body, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set refresh token in httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const result = await this.loginUseCase.execute(req.body, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set refresh token in httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * POST /api/v1/auth/refresh
   * Reads refresh token from httpOnly cookie.
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const oldRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!oldRefreshToken) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token is required',
        },
      });
      return;
    }

    const result = await this.refreshTokenUseCase.execute(oldRefreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Set new refresh token in cookie (rotation)
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * POST /api/v1/auth/logout
   * Invalidates refresh token and clears cookie.
   */
  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    await this.logoutUseCase.execute(refreshToken);

    // Clear refresh token cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/api/v1/auth',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
