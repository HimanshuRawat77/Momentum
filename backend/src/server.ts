import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks';
import statsRouter from './routes/stats';
import { requireAuth } from './auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const explicitOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow non-browser tools and server-side clients without Origin header.
    if (!origin) {
      return callback(null, true);
    }

    const isExplicitOrigin = explicitOrigins.includes(origin);
    const isLocalDevOrigin = localhostOriginPattern.test(origin);

    if (isExplicitOrigin || isLocalDevOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Register routes
app.use('/api/tasks', requireAuth, tasksRouter);
app.use('/api/stats', requireAuth, statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);

  if (err?.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Momentum API Server running on port ${PORT}`);
  console.log(`CORS local dev origins: localhost / 127.0.0.1 (any port)`);
  if (explicitOrigins.length > 0) {
    console.log(`CORS explicit origins: ${explicitOrigins.join(', ')}`);
  }
  console.log(`=========================================`);
});
