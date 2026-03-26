/**
 * Password value object — validates password strength.
 *
 * Domain layer value object. Does NOT hash — hashing is an infrastructure concern.
 * Only validates that the plaintext password meets strength requirements.
 *
 * Rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */
export class Password {
  private readonly _value: string;

  constructor(value: string) {
    const errors = Password.validate(value);
    if (errors.length > 0) {
      throw new Error(`Invalid password: ${errors.join(', ')}`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * Validate password strength. Returns array of error messages.
   * Empty array means the password is valid.
   */
  static validate(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit');
    }

    return errors;
  }

  /**
   * Check if a password string meets the strength requirements.
   */
  static isStrong(password: string): boolean {
    return Password.validate(password).length === 0;
  }
}
