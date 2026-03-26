import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

/**
 * AsyncLocalStorage instance for storing correlation IDs.
 * This allows us to track a request through the entire lifecycle
 * without passing the correlation ID explicitly through every function call.
 */
const correlationStorage = new AsyncLocalStorage<string>();

/**
 * Get the current correlation ID from the async context.
 * Returns undefined if no correlation ID is set (e.g., outside a request context).
 */
export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore();
}

/**
 * Run a callback within a correlation ID context.
 * If no correlation ID is provided, a new UUID is generated.
 */
export function runWithCorrelationId<T>(correlationId: string | undefined, fn: () => T): T {
  const id = correlationId || uuidv4();
  return correlationStorage.run(id, fn);
}
