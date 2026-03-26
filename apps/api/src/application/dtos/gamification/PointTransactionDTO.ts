import { PointTransaction } from '../../../domain/entities/PointTransaction';

export interface PointTransactionDTO {
  id: string;
  actionCode: string;
  points: number;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
}

export function toPointTransactionDTO(tx: PointTransaction): PointTransactionDTO {
  return {
    id: tx.id,
    actionCode: tx.actionCode,
    points: tx.points,
    referenceId: tx.referenceId,
    referenceType: tx.referenceType,
    createdAt: tx.createdAt,
  };
}
