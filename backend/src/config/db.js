import mysql from 'mysql2/promise';
import { env } from './env.js';

export function sslOptions() {
  if (!env.db.ssl) return undefined;
  // With a CA certificate the server identity is fully verified.
  // Without one the connection is still encrypted, but the certificate is not checked.
  return env.db.sslCa ? { ca: env.db.sslCa, rejectUnauthorized: true } : { rejectUnauthorized: false };
}

// Shared connection pool used by every controller.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: sslOptions(),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
  charset: 'utf8mb4'
});

// Every connection uses the same time zone, so dates and "today" are consistent.
pool.pool.on('connection', (conn) => {
  conn.query(`SET time_zone = '${env.db.timeZone}'`);
});

/** Run a query and return only the rows. */
export async function query(sql, params = {}) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Run a query and return the first row (or null). */
export async function queryOne(sql, params = {}) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}
