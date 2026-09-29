import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1); // behind Render's proxy: needed for correct client IPs in rate limiting
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow tools like curl/Postman (no origin) and the configured frontend URLs.
      if (!origin || env.clientOrigins.includes('*') || env.clientOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type']
  })
);
app.use(express.json({ limit: '200kb' }));

app.get('/', (req, res) => res.json({ name: 'CodeTrack Java API', status: 'ok', docs: '/api/health' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unreachable' });
  }
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
