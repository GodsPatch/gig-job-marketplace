import { Router, Request, Response } from 'express';
import { query, pool } from '../../../infrastructure/database/connection';
import { config } from '../../../infrastructure/config';

const router = Router();

/**
 * GET /api/v1/health
 *
 * Basic health check — lightweight, for load balancers and uptime monitors.
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbStart = Date.now();
    await query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latency: `${dbLatency}ms`,
        },
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
      },
    });
  }
});

/**
 * GET /api/v1/health/deep
 *
 * Deep health check — verifies all subsystems:
 * - Database connectivity and response time
 * - Connection pool stats
 * - Application version and environment
 * - Memory usage
 *
 * Returns overall status: 'healthy' | 'degraded' | 'unhealthy'
 */
router.get('/health/deep', async (_req: Request, res: Response) => {
  const checks: Record<string, any> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // 1. Database check
  try {
    const dbStart = Date.now();
    const result = await query<{ now: Date }>('SELECT NOW() as now');
    const dbResponseTimeMs = Date.now() - dbStart;

    checks.database = {
      status: 'up',
      responseTimeMs: dbResponseTimeMs,
      serverTime: result.rows[0]?.now,
    };

    // Flag slow DB responses
    if (dbResponseTimeMs > 1000) {
      overallStatus = 'degraded';
      checks.database.warning = 'Database response time exceeds 1s';
    }
  } catch (error) {
    overallStatus = 'unhealthy';
    checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 2. Connection pool stats
  checks.connectionPool = {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };

  if (pool.waitingCount > 5) {
    overallStatus = overallStatus === 'unhealthy' ? 'unhealthy' : 'degraded';
    checks.connectionPool.warning = 'High number of waiting connections';
  }

  // 3. Memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
    rssMB: Math.round(memUsage.rss / 1024 / 1024),
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  res.status(statusCode).json({
    success: overallStatus !== 'unhealthy',
    data: {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '0.1.0',
      environment: config.NODE_ENV,
      checks,
    },
  });
});

export default router;
