// Creates the MySQL tables and seeds demo data without starting the server.
// Usage: npm run db:setup
import { setupDatabase } from '../src/db/setup.js';
import { pool } from '../src/config/db.js';

try {
  await setupDatabase();
} catch (err) {
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
