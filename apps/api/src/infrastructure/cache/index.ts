import NodeCache from 'node-cache';
import { logger } from '../logging';

/**
 * In-memory cache service using node-cache.
 *
 * TTL-based cache for frequently accessed, rarely changing data.
 * For MVP production use — Redis is an extension point for scaling.
 *
 * Cache keys and TTLs:
 * - categories:     300s  (5 min) — invalidated on category create/update
 * - skills:         600s  (10 min) — very rarely changes
 * - achievements:   1800s (30 min) — seed data only
 * - trending_jobs:  120s  (2 min) — automatic expiry
 */

const DEFAULT_TTL = 300; // 5 minutes
const CHECK_PERIOD = 60; // Check expired keys every 60 seconds

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: true, // Return clones to prevent mutation
});

// Log cache events in debug mode
cache.on('expired', (key: string) => {
  logger.debug('Cache key expired', { key });
});

/**
 * Predefined cache TTLs (in seconds) for different data types.
 */
export const CACHE_TTL = {
  CATEGORIES: 300,       // 5 minutes
  SKILLS: 600,           // 10 minutes
  ACHIEVEMENTS: 1800,    // 30 minutes
  TRENDING_JOBS: 120,    // 2 minutes
} as const;

/**
 * Get a value from cache.
 */
export function cacheGet<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

/**
 * Set a value in cache with optional TTL.
 */
export function cacheSet<T>(key: string, value: T, ttl?: number): boolean {
  return cache.set<T>(key, value, ttl ?? DEFAULT_TTL);
}

/**
 * Delete a specific cache key (for invalidation).
 */
export function cacheDel(key: string): number {
  return cache.del(key);
}

/**
 * Delete cache keys matching a prefix (e.g., 'categories' invalidates all category caches).
 */
export function cacheDelByPrefix(prefix: string): number {
  const keys = cache.keys().filter(k => k.startsWith(prefix));
  return cache.del(keys);
}

/**
 * Flush all cache entries.
 */
export function cacheFlush(): void {
  cache.flushAll();
  logger.info('Cache flushed');
}

/**
 * Get cache statistics.
 */
export function cacheStats() {
  return cache.getStats();
}

export { cache };
