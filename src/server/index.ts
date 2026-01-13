import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.ts';
import { errorHandler } from './errors';
import logger from './logger';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';

// CORS middleware - Allow all origins for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
app.use(errorHandler);

// Server startup
app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`, { port: PORT, host: HOST });
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Network access: http://192.168.3.107:${PORT}/api/health`);
});
