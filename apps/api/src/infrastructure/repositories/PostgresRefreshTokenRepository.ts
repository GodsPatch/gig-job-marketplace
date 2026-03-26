import { IRefreshTokenRepository, RefreshTokenRecord, CreateRefreshTokenData } from '../../domain/repositories/IRefreshTokenRepository';
import { query } from '../database/connection';

/**
 * Row type from PostgreSQL refresh_tokens table.
 */
interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  is_revoked: boolean;
  replaced_by: string | null;
  created_at: Date;
  revoked_at: Date | null;
  user_agent: string | null;
  ip_address: string | null;
}

/**
 * Map a DB row to RefreshTokenRecord.
 */
function rowToRecord(row: RefreshTokenRow): RefreshTokenRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    isRevoked: row.is_revoked,
    replacedBy: row.replaced_by,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
  };
}

/**
 * PostgreSQL implementation of IRefreshTokenRepository.
 * Supports token rotation and reuse detection.
 */
export class PostgresRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<RefreshTokenRecord> {
    const result = await query<RefreshTokenRow>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.userId,
        data.tokenHash,
        data.expiresAt,
        data.userAgent || null,
        data.ipAddress || null,
      ],
    );
    return rowToRecord(result.rows[0]!);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const result = await query<RefreshTokenRow>(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash],
    );
    return result.rows[0] ? rowToRecord(result.rows[0]) : null;
  }

  async revokeById(id: string, replacedById?: string): Promise<void> {
    if (replacedById) {
      await query(
        'UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW(), replaced_by = $2 WHERE id = $1',
        [id, replacedById],
      );
    } else {
      await query(
        'UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW() WHERE id = $1',
        [id],
      );
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW() WHERE user_id = $1 AND is_revoked = false',
      [userId],
    );
  }

  async deleteExpired(): Promise<number> {
    const result = await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW() AND is_revoked = true',
    );
    return result.rowCount ?? 0;
  }
}
