import { DomainError } from './DomainError';

export class DailyPointCapError extends DomainError {
  constructor(userId: string) {
    super(`Tài khoản ${userId} đã đạt giới hạn điểm trong ngày (100 điểm).`, 'DAILY_POINT_CAP_REACHED', 400);
  }
}
