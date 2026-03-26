import winston from 'winston';
import { config } from '../config';
import { getCorrelationId } from './correlation';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

/**
 * Custom format for development — colorized and human-readable.
 */
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const correlationId = getCorrelationId();
    const corrStr = correlationId ? ` [${correlationId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${ts} ${level}${corrStr}: ${message}${metaStr}${stackStr}`;
  }),
);

/**
 * Production format — structured JSON for log aggregation.
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

/**
 * Add correlation ID to every log entry automatically.
 */
const addCorrelationId = winston.format((info) => {
  const correlationId = getCorrelationId();
  if (correlationId) {
    info.correlationId = correlationId;
  }
  return info;
});

/**
 * Winston logger singleton.
 * - JSON format in production for structured logging
 * - Colorized pretty format in development for readability
 * - Automatically includes correlation ID in every log entry
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: addCorrelationId(),
  transports: [
    new winston.transports.Console({
      format: config.NODE_ENV === 'production' ? prodFormat : devFormat,
    }),
  ],
  // Don't exit on uncaught exceptions — let the process handler deal with it
  exitOnError: false,
});
