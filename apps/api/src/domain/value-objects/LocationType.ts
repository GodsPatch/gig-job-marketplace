export enum LocationTypeEnum {
  REMOTE = 'remote',
  ONSITE = 'onsite',
  HYBRID = 'hybrid'
}

export class LocationType {
  private constructor(public readonly value: LocationTypeEnum) {}

  static fromString(type: string): LocationType {
    if (Object.values(LocationTypeEnum).includes(type as LocationTypeEnum)) {
      return new LocationType(type as LocationTypeEnum);
    }
    throw new Error(`Invalid location type: ${type}`);
  }

  static remote(): LocationType { return new LocationType(LocationTypeEnum.REMOTE); }
  static onsite(): LocationType { return new LocationType(LocationTypeEnum.ONSITE); }
  static hybrid(): LocationType { return new LocationType(LocationTypeEnum.HYBRID); }

  requiresLocationDetails(): boolean {
    return this.value === LocationTypeEnum.ONSITE || this.value === LocationTypeEnum.HYBRID;
  }
}
