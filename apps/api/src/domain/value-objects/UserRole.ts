import { UserRole as UserRoleType } from '../entities/User';

/**
 * UserRole value object — validates and encapsulates user role.
 *
 * Valid roles: 'worker', 'employer', 'admin'
 * Note: 'admin' cannot be assigned via registration.
 */
export class UserRole {
  private static readonly VALID_ROLES: UserRoleType[] = ['worker', 'employer', 'admin'];
  private static readonly REGISTRABLE_ROLES: UserRoleType[] = ['worker', 'employer'];

  private readonly _value: UserRoleType;

  constructor(value: string) {
    if (!UserRole.isValid(value)) {
      throw new Error(`Invalid user role: ${value}. Valid roles: ${UserRole.VALID_ROLES.join(', ')}`);
    }
    this._value = value as UserRoleType;
  }

  get value(): UserRoleType {
    return this._value;
  }

  /**
   * Check if a role string is valid.
   */
  static isValid(role: string): role is UserRoleType {
    return UserRole.VALID_ROLES.includes(role as UserRoleType);
  }

  /**
   * Check if a role can be selected during registration.
   * Admin role cannot be self-assigned.
   */
  static isRegistrable(role: string): boolean {
    return UserRole.REGISTRABLE_ROLES.includes(role as UserRoleType);
  }

  equals(other: UserRole): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
