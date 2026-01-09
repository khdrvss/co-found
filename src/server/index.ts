import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.ts';
import { errorHandler } from './errors';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method.toUpperCase()} ${req.path}`);
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
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});
