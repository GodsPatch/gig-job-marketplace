/**
 * Password service interface — port for password hashing operations.
 *
 * Separates password hashing (infrastructure concern) from domain/application logic.
 * Implementation uses bcrypt with cost factor 12.
 */
export interface IPasswordService {
  /**
   * Hash a plain text password.
   * @returns The hashed password string
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a plain text password against a stored hash.
   * @returns true if password matches the hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}
