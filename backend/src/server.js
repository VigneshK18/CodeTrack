import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { setupDatabase } from './db/setup.js';

async function start() {
  if (env.autoSeed) {
    await setupDatabase();
  } else {
    await pool.query('SELECT 1'); // fail fast if MySQL is unreachable
  }

  const server = app.listen(env.port, () => {
    console.log(`CodeTrack API running on http://localhost:${env.port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  if (err.code === 'ECONNREFUSED') console.error('Is MySQL running? Check DB_HOST / DB_PORT in backend/.env');
  if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER / DB_PASSWORD in backend/.env');
  process.exit(1);
});
