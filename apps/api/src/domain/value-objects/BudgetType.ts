export enum BudgetTypeEnum {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  NEGOTIABLE = 'negotiable'
}

export class BudgetType {
  private constructor(public readonly value: BudgetTypeEnum) {}

  static fromString(type: string): BudgetType {
    if (Object.values(BudgetTypeEnum).includes(type as BudgetTypeEnum)) {
      return new BudgetType(type as BudgetTypeEnum);
    }
    throw new Error(`Invalid budget type: ${type}`);
  }

  static fixed(): BudgetType { return new BudgetType(BudgetTypeEnum.FIXED); }
  static hourly(): BudgetType { return new BudgetType(BudgetTypeEnum.HOURLY); }
  static negotiable(): BudgetType { return new BudgetType(BudgetTypeEnum.NEGOTIABLE); }

  isNegotiable(): boolean {
    return this.value === BudgetTypeEnum.NEGOTIABLE;
  }

  requiresBudgetRange(): boolean {
    return this.value === BudgetTypeEnum.FIXED || this.value === BudgetTypeEnum.HOURLY;
  }
}
