import { config } from './infrastructure/config';
import { logger } from './infrastructure/logging';
import { initSentry } from './infrastructure/error-tracking/sentry';
import { testConnection, closePool } from './infrastructure/database/connection';
import { app } from './app';

/**
 * Server entry point.
 *
 * Boot sequence:
 * 1. Config already validated (imported from config module)
 * 2. Initialize Sentry error tracking
 * 3. Test database connection
 * 4. Start Express server
 * 5. Register graceful shutdown handlers
 */
async function bootstrap(): Promise<void> {
  try {
    // 1. Init Sentry
    initSentry(config.SENTRY_DSN);

    // 2. Test database connection
    await testConnection();

    // 2.5 Run Auto Migrations
    const { runAutoMigrations } = await import('./infrastructure/database/runMigrations.js');
    await runAutoMigrations();

    // 3. Start server
    const version = process.env.npm_package_version || '0.1.0';
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Gig Marketplace API started`, {
        version,
        environment: config.NODE_ENV,
        port: config.PORT,
        node: process.version,
        pid: process.pid,
      });
    });

    // 4. Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closePool();
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown — graceful shutdown timed out');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

bootstrap();
