import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.ts';
import { errorHandler } from './errors';
import logger from './logger';
import http from 'http';
import { initSocket, getIo } from './socket';
import { closeRedisClient } from './redisClient';
import metricsRegister from './metrics';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';

// Initialize Sentry if DSN is present
if (process.env.SENTRY_DSN) {
  const SentryNode: any = require('@sentry/node');
  SentryNode.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  });

  // Sentry request handlers
  app.use(SentryNode.Handlers.requestHandler());
  app.use(SentryNode.Handlers.tracingHandler());
}

// Basic security headers
app.use(helmet());
// Response compression
app.use(compression());

// CORS middleware - Allow specific origins
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://co-found.uz',
    'https://www.co-found.uz',
    'https://api.co-found.uz',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    method: req.method, 
    path: req.path, 
    userAgent: req.get('User-Agent'),
    ip: req.ip 
  });
  next();
});

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const status: any = { status: 'ok', timestamp: new Date().toISOString(), checks: {} };
  try {
    const { query } = await import('./db');
    await query('SELECT 1');
    status.checks.db = { ok: true };
  } catch (err) {
    status.status = 'degraded';
    status.checks.db = { ok: false, error: String(err) };
  }

  try {
    const { getRedisClient } = await import('./redisClient');
    const redis = await getRedisClient();
    if (redis) {
      // ping or echo
      await (redis as any).ping();
      status.checks.redis = { ok: true };
    } else {
      status.checks.redis = { ok: false, error: 'REDIS_URL not set or client not connected' };
    }
  } catch (err) {
    status.status = 'degraded';
    status.checks.redis = { ok: false, error: String(err) };
  }

  const code = status.status === 'ok' ? 200 : 503;
  res.status(code).json(status);
});

// Metrics endpoint
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (err) {
    res.status(500).end(err instanceof Error ? err.stack : String(err));
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    statusCode: 404,
  });
});

// Error handling middleware (must be last)
// Integrate Sentry error handler before our error handler
if (process.env.SENTRY_DSN) {
  const SentryNode: any = require('@sentry/node');
  app.use(SentryNode.Handlers.errorHandler());
}

app.use(errorHandler);

// Create HTTP server and attach socket.io
const server = http.createServer(app);

server.listen(PORT, HOST, async () => {
  logger.info(`Server running on http://${HOST}:${PORT}`, { port: PORT, host: HOST });
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Network access: http://192.168.3.107:${PORT}/api/health`);

  try {
    await initSocket(server);
  } catch (err) {
    logger.warn('Socket initialization error', { err });
  }
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  try {
    const io = getIo();
    if (io) {
      io.close();
      logger.info('Socket.IO server closed');
    }

    await closeRedisClient();

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      logger.warn('Forcefully exiting');
      process.exit(1);
    }, 10000);
  } catch (err) {
    logger.error('Error during shutdown', { err });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
