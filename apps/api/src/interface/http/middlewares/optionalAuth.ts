import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../infrastructure/config/index';

/**
 * Similar to authenticate middleware but does not throw if no token is present.
 * Sets req.user = decoded if valid, else req.user = null.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    // If token is invalid/expired, we just treat as anonymous
    req.user = undefined;
    next();
  }
};
