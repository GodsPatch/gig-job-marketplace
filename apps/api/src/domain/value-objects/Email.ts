/**
 * Email value object — validates email format.
 *
 * Domain layer value object: immutable, defined by its value.
 * Encapsulates email validation rules.
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!Email.isValid(trimmed)) {
      throw new Error(`Invalid email format: ${value}`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  /**
   * Validates email format using a standard regex pattern.
   */
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
