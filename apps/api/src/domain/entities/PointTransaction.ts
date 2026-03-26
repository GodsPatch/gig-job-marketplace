export class PointTransaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly actionCode: string,
    public readonly points: number,
    public readonly referenceId: string | null = null,
    public readonly referenceType: string | null = null,
    public readonly metadata: Record<string, any> | null = null,
    public readonly createdAt: Date = new Date(),
  ) {
    if (points <= 0) {
      throw new Error('Points must be greater than 0');
    }
  }
}
