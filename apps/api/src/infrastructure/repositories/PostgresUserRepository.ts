import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { query } from '../database/connection';

/**
 * Row type from PostgreSQL users table.
 */
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: string;
  status: string;
  phone_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Map a DB row to User entity props.
 */
function rowToUser(row: UserRow): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role as UserProps['role'],
    status: row.status as UserProps['status'],
    phoneNumber: row.phone_number,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * PostgreSQL implementation of IUserRepository.
 * Uses the pg driver directly (no ORM).
 */
export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    return result.rows[0] ? rowToUser(result.rows[0]) : null;
  }

  async create(user: User): Promise<User> {
    const result = await query<UserRow>(
      `INSERT INTO users (id, email, password_hash, full_name, role, status, phone_number, avatar_url, bio, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.fullName,
        user.role,
        user.status,
        user.phoneNumber,
        user.avatarUrl,
        user.bio,
        user.createdAt,
        user.updatedAt,
      ],
    );
    return rowToUser(result.rows[0]!);
  }

  async update(user: User): Promise<User> {
    const result = await query<UserRow>(
      `UPDATE users
       SET full_name = $2, phone_number = $3, avatar_url = $4, bio = $5, updated_at = $6
       WHERE id = $1
       RETURNING *`,
      [
        user.id,
        user.fullName,
        user.phoneNumber,
        user.avatarUrl,
        user.bio,
        user.updatedAt,
      ],
    );
    return rowToUser(result.rows[0]!);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
      [email.toLowerCase()],
    );
    return result.rows[0]?.exists ?? false;
  }
}
