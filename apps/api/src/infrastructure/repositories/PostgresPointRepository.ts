import { query } from '../database/connection';
import { IPointRepository, LeaderboardEntry, PaginatedResult } from '../../domain/repositories/IPointRepository';
import { PointTransaction } from '../../domain/entities/PointTransaction';

export class PostgresPointRepository implements IPointRepository {
  async createTransaction(tx: PointTransaction): Promise<PointTransaction> {
    await query(
      `INSERT INTO point_transactions (id, user_id, action_code, points, reference_id, reference_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tx.id, tx.userId, tx.actionCode, tx.points, tx.referenceId, tx.referenceType, tx.metadata ? JSON.stringify(tx.metadata) : null, tx.createdAt]
    );
    return tx;
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const res = await query(`SELECT total_points FROM user_points_summary WHERE user_id = $1`, [userId]);
    return res.rows[0]?.total_points || 0;
  }

  async getUserCyclePoints(userId: string, cycle: 'weekly' | 'monthly'): Promise<number> {
    const col = cycle === 'weekly' ? 'weekly_points' : 'monthly_points';
    const res = await query(`SELECT ${col} FROM user_points_summary WHERE user_id = $1`, [userId]);
    return res.rows[0]?.[col] || 0;
  }

  async getPointHistory(userId: string, page: number, limit: number): Promise<PaginatedResult<PointTransaction>> {
    const offset = (page - 1) * limit;
    const [dataRes, countRes] = await Promise.all([
      query(`SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, offset]),
      query(`SELECT COUNT(*) FROM point_transactions WHERE user_id = $1`, [userId])
    ]);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);
    const items = dataRes.rows.map(r => new PointTransaction(
      r.id, r.user_id, r.action_code, r.points, r.reference_id, r.reference_type, r.metadata, r.created_at
    ));
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDailyPointsTotal(userId: string, date: Date): Promise<number> {
    const res = await query(
      `SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE user_id = $1 AND DATE(created_at) = DATE($2)`,
      [userId, date]
    );
    return parseInt(res.rows[0]?.total || '0', 10);
  }

  async hasActionToday(userId: string, actionCode: string): Promise<boolean> {
    const res = await query(
      `SELECT EXISTS (SELECT 1 FROM point_transactions WHERE user_id = $1 AND action_code = $2 AND DATE(created_at) = CURRENT_DATE)`,
      [userId, actionCode]
    );
    return res.rows[0]?.exists || false;
  }

  async hasActionEver(userId: string, actionCode: string, referenceId?: string): Promise<boolean> {
    if (referenceId) {
      const res = await query(
        `SELECT EXISTS (SELECT 1 FROM point_transactions WHERE user_id = $1 AND action_code = $2 AND reference_id = $3)`,
        [userId, actionCode, referenceId]
      );
      return res.rows[0]?.exists || false;
    }
    const res = await query(
      `SELECT EXISTS (SELECT 1 FROM point_transactions WHERE user_id = $1 AND action_code = $2)`,
      [userId, actionCode]
    );
    return res.rows[0]?.exists || false;
  }

  async getLeaderboard(cycle: 'weekly' | 'monthly', limit: number): Promise<LeaderboardEntry[]> {
    const dateQuery = cycle === 'weekly' ? `date_trunc('week', NOW())` : `date_trunc('month', NOW())`;
    
    // Evaluate ranking directly from tx table dynamically
    const res = await query(`
      WITH RankedUsers AS (
        SELECT u.id, u.full_name, u.avatar_url, u.role, SUM(pt.points) as points, MIN(pt.created_at) as earliest_tx
        FROM point_transactions pt
        JOIN users u ON u.id = pt.user_id
        WHERE pt.created_at >= ${dateQuery}
        GROUP BY u.id, u.full_name, u.avatar_url, u.role
      )
      SELECT *, RANK() OVER(ORDER BY points DESC, earliest_tx ASC) as rank
      FROM RankedUsers
      ORDER BY rank ASC
      LIMIT $1
    `, [limit]);

    return res.rows.map(r => ({
      rank: parseInt(r.rank, 10),
      points: parseInt(r.points, 10),
      user: { id: r.id, fullName: r.full_name, avatarUrl: r.avatar_url, role: r.role }
    }));
  }

  async getUserRank(userId: string, cycle: 'weekly' | 'monthly'): Promise<{ rank: number; totalParticipants: number } | null> {
    const dateQuery = cycle === 'weekly' ? `date_trunc('week', NOW())` : `date_trunc('month', NOW())`;
    
    const res = await query(`
      WITH RankedUsers AS (
        SELECT user_id, SUM(points) as points, MIN(created_at) as earliest_tx
        FROM point_transactions
        WHERE created_at >= ${dateQuery}
        GROUP BY user_id
      ), RankedList AS (
        SELECT user_id, RANK() OVER(ORDER BY points DESC, earliest_tx ASC) as rank
        FROM RankedUsers
      )
      SELECT rank, (SELECT COUNT(*) FROM RankedList) as total_participants FROM RankedList WHERE user_id = $1
    `, [userId]);

    if (!res.rows[0]) return null;
    return {
      rank: parseInt(res.rows[0].rank, 10),
      totalParticipants: parseInt(res.rows[0].total_participants, 10),
    };
  }

  async updateUserSummary(userId: string): Promise<void> {
    await query(`
      INSERT INTO user_points_summary (user_id, total_points, weekly_points, monthly_points)
      VALUES (
        $1,
        (SELECT COALESCE(SUM(points), 0) FROM point_transactions WHERE user_id = $1),
        (SELECT COALESCE(SUM(points), 0) FROM point_transactions WHERE user_id = $1 AND created_at >= date_trunc('week', NOW())),
        (SELECT COALESCE(SUM(points), 0) FROM point_transactions WHERE user_id = $1 AND created_at >= date_trunc('month', NOW()))
      )
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        weekly_points = EXCLUDED.weekly_points,
        monthly_points = EXCLUDED.monthly_points,
        updated_at = NOW();
    `, [userId]);
  }

  async updateLoginStreak(userId: string): Promise<void> {
    await query(`
      INSERT INTO user_points_summary (user_id, current_streak, longest_streak, last_login_date)
      VALUES ($1, 1, 1, CURRENT_DATE)
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak = CASE
          WHEN user_points_summary.last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN user_points_summary.current_streak + 1
          WHEN user_points_summary.last_login_date = CURRENT_DATE THEN user_points_summary.current_streak
          ELSE 1
        END,
        longest_streak = GREATEST(
          user_points_summary.longest_streak,
          CASE
            WHEN user_points_summary.last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN user_points_summary.current_streak + 1
            WHEN user_points_summary.last_login_date = CURRENT_DATE THEN user_points_summary.current_streak
            ELSE 1
          END
        ),
        last_login_date = CURRENT_DATE,
        updated_at = NOW();
    `, [userId]);
  }
}
