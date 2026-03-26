export class Rating {
  readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`Invalid rating: ${value}. Must be integer between 1 and 5`);
    }
    this.value = value;
  }

  equals(other: Rating): boolean { return this.value === other.value; }
  toString(): string { return `${this.value}/5`; }
}
