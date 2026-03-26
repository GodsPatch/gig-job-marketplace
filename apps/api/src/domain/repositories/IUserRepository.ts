import { User } from '../entities/User';

/**
 * User repository interface — defines the contract for user data access.
 *
 * This is a port in Clean Architecture. The actual implementation
 * lives in the infrastructure layer (infrastructure/repositories/).
 *
 * IMPORTANT: Domain layer defines WHAT operations are needed.
 * Infrastructure layer defines HOW they are implemented.
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address.
   * Returns null if not found.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user in the data store.
   * Returns the created user with generated ID and timestamps.
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user.
   * Returns the updated user with new updatedAt timestamp.
   */
  update(user: User): Promise<User>;

  /**
   * Check if an email is already registered.
   * Used during registration to check for duplicates.
   */
  existsByEmail(email: string): Promise<boolean>;
}
