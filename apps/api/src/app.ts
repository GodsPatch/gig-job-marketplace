import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './infrastructure/config';
import { correlationIdMiddleware } from './interface/http/middlewares/correlationId';
import { requestLogger } from './interface/http/middlewares/requestLogger';
import { errorHandler } from './interface/http/middlewares/errorHandler';
import routes from './interface/http/routes';

/**
 * Express application factory.
 *
 * Middleware chain (order matters):
 * 1. Helmet (security headers)
 * 2. CORS
 * 3. Body parser (express.json) with size limit
 * 4. Cookie parser
 * 5. Correlation ID middleware
 * 6. Request logger middleware
 * 7. API routes
 * 8. 404 handler
 * 9. Global error handler (MUST be last)
 */
const app = express();

// --- Security Headers (Helmet) ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", config.CORS_ORIGIN],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// --- CORS ---
app.use(cors({
  origin: [config.CORS_ORIGIN],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// --- Body Parsers with size limits ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// --- Request Tracking ---
app.use(correlationIdMiddleware);
app.use(requestLogger);

// --- API Routes ---
app.use('/api/v1', routes);

// --- 404 Handler ---
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${_req.method} ${_req.originalUrl} not found`,
    },
  });
});

// --- Global Error Handler (MUST be last) ---
app.use(errorHandler);

export { app };
