import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../../infrastructure/services/JwtTokenService';
import { UnauthorizedError, ForbiddenError } from '../middlewares/errorHandler';

const tokenService = new JwtTokenService();

/**
 * Extend Express Request to include authenticated user info.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Auth middleware — verifies JWT access token from Authorization header.
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify JWT using JwtTokenService
 * 3. Attach decoded payload to req.user
 * 4. If invalid/expired → throw UnauthorizedError
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is required');
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

/**
 * Role-based authorization middleware factory.
 * Must be used AFTER authMiddleware.
 *
 * Usage:
 * ```ts
 * router.get('/admin', authMiddleware, requireRole('admin'), controller.adminAction);
 * ```
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}
