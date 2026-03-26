import 'dotenv/config';
import { query } from '../connection';
import { logger } from '../../logging';
import { seedAchievementDefinitions } from './005_seed-achievement-definitions';

/**
 * Seed runner — executes all seed scripts.
 *
 * M1 SKELETON: Only seed structure is set up.
 * Actual seed data will be added as needed in M2+.
 *
 * All seeds must be idempotent (safe to run multiple times).
 */
async function runSeeds(): Promise<void> {
  logger.info('Starting database seeding...');

  try {
    // Example seed (commented out — no real data needed for M1)
    // await seedUsers();
    // await seedSampleJobs();
    // await seedSkills();
    await seedAchievementDefinitions();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }

  process.exit(0);
}

/**
 * Example seed function — insert default admin user.
 * Uses ON CONFLICT DO NOTHING for idempotency.
 *
 * TODO M2: Implement actual seed data
 */
export async function seedUsers(): Promise<void> {
  logger.info('Seeding users...');

  await query(`
    INSERT INTO users (email, password_hash, full_name, role, status)
    VALUES ('admin@example.com', 'placeholder-hash', 'Admin User', 'admin', 'active')
    ON CONFLICT (email) DO NOTHING;
  `);

  logger.info('Users seeded');
}

runSeeds();
