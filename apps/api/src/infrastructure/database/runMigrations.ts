import migrate from 'node-pg-migrate';
import { pool } from './connection';
import { logger } from '../logging';
import path from 'path';

export async function runAutoMigrations() {
  const client = await pool.connect();
  try {
    logger.info('Starting programmatic database migrations...');
    await migrate({
      dbClient: client as unknown as any,
      dir: path.join(process.cwd(), 'src/infrastructure/database/migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      count: Infinity,
      ignorePattern: '.*\\.ts',
    });
    logger.info('Database migrations completed successfully.');
  } catch (error) {
    logger.error('Database migration failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    client.release();
  }
}
