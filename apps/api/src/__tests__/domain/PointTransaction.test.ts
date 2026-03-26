import { PointTransaction } from '../../domain/entities/PointTransaction';

describe('PointTransaction Entity Domain Logic', () => {
  it('should create a valid point transaction', () => {
    const tx = new PointTransaction('tx-1', 'user-1', 'LOGIN', 10);
    expect(tx.id).toBe('tx-1');
    expect(tx.userId).toBe('user-1');
    expect(tx.actionCode).toBe('LOGIN');
    expect(tx.points).toBe(10);
    expect(tx.referenceId).toBeNull();
    expect(tx.referenceType).toBeNull();
    expect(tx.metadata).toBeNull();
    expect(tx.createdAt).toBeInstanceOf(Date);
  });

  it('should create a transaction with reference', () => {
    const tx = new PointTransaction('tx-2', 'user-1', 'JOB_PUBLISHED', 20, 'job-1', 'job');
    expect(tx.referenceId).toBe('job-1');
    expect(tx.referenceType).toBe('job');
  });

  it('should create a transaction with metadata', () => {
    const meta = { streak: 5 };
    const tx = new PointTransaction('tx-3', 'user-1', 'LOGIN_STREAK', 50, null, null, meta);
    expect(tx.metadata).toEqual({ streak: 5 });
  });

  it('should reject zero points', () => {
    expect(() => new PointTransaction('tx-1', 'user-1', 'LOGIN', 0)).toThrow('Points must be greater than 0');
  });

  it('should reject negative points', () => {
    expect(() => new PointTransaction('tx-1', 'user-1', 'LOGIN', -5)).toThrow('Points must be greater than 0');
  });

  it('should accept points of 1 (edge case)', () => {
    const tx = new PointTransaction('tx-1', 'user-1', 'LOGIN', 1);
    expect(tx.points).toBe(1);
  });
});
