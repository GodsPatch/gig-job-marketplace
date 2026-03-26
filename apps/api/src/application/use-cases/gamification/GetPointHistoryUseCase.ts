import { IPointRepository, PaginatedResult } from '../../../domain/repositories/IPointRepository';
import { PointTransactionDTO, toPointTransactionDTO } from '../../dtos/gamification/PointTransactionDTO';

export class GetPointHistoryUseCase {
  constructor(private pointRepo: IPointRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<PaginatedResult<PointTransactionDTO>> {
    const pagedTransactions = await this.pointRepo.getPointHistory(userId, page, limit);
    
    return {
      ...pagedTransactions,
      items: pagedTransactions.items.map(toPointTransactionDTO),
    };
  }
}
