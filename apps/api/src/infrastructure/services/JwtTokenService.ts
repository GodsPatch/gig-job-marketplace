import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ITokenService, AccessTokenPayload } from '../../application/interfaces/ITokenService';
import { config } from '../config';

/**
 * JWT + Crypto implementation of ITokenService.
 *
 * - Access tokens: JWT HS256, expire per config (default 15m)
 * - Refresh tokens: crypto.randomBytes(40) → hex string
 * - Refresh token hashing: SHA-256 (for DB storage)
 */
export class JwtTokenService implements ITokenService {
  /**
   * Generate a signed JWT access token.
   */
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRES_IN as string,
        issuer: 'gig-marketplace',
      } as jwt.SignOptions,
    );
  }

  /**
   * Generate a random refresh token string.
   * 40 bytes → 80 hex chars, cryptographically secure.
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Verify and decode a JWT access token.
   * Throws if token is invalid or expired.
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'gig-marketplace',
    }) as jwt.JwtPayload;

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as string,
    };
  }

  /**
   * Hash a refresh token using SHA-256 for secure DB storage.
   * We NEVER store plaintext refresh tokens.
   */
  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
