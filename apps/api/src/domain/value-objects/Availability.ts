export type AvailabilityValue = 'available' | 'busy' | 'unavailable';

const VALID_VALUES: AvailabilityValue[] = ['available', 'busy', 'unavailable'];

export class Availability {
  readonly value: AvailabilityValue;

  constructor(value: AvailabilityValue) {
    if (!VALID_VALUES.includes(value)) {
      throw new Error(`Invalid availability: ${value}. Must be one of: ${VALID_VALUES.join(', ')}`);
    }
    this.value = value;
  }

  static available(): Availability { return new Availability('available'); }
  static busy(): Availability { return new Availability('busy'); }
  static unavailable(): Availability { return new Availability('unavailable'); }

  equals(other: Availability): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}
