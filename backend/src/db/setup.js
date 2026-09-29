import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { pool, query, queryOne, sslOptions } from '../config/db.js';
import { slugify } from '../utils/sql.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = process.env.SCHEMA_PATH || path.resolve(here, '../../../database/schema.sql');
const PROBLEMS_PATH = path.resolve(here, '../data/problems.json');

const DEMO_USERS = [
  { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'ADMIN' },
  { name: 'Demo User', email: 'user@example.com', password: 'user123', role: 'USER' }
];

// Columns added after the first release; created on existing databases automatically.
const COLUMN_MIGRATIONS = [
  { table: 'problems', column: 'driver_code', ddl: 'ALTER TABLE problems ADD COLUMN driver_code TEXT AFTER default_code_template' },
  { table: 'problems', column: 'param_names', ddl: 'ALTER TABLE problems ADD COLUMN param_names VARCHAR(255) AFTER driver_code' }
];

async function ensureDatabaseExists() {
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    ssl: sslOptions()
  });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } catch (err) {
    // Hosted MySQL users often cannot create databases; the configured one must already exist.
    if (err.code !== 'ER_DBACCESS_DENIED_ERROR' && err.code !== 'ER_ACCESS_DENIED_ERROR') throw err;
  } finally {
    await conn.end();
  }
}

async function createTables() {
  const sql = await readFile(SCHEMA_PATH, 'utf8');
  const statements = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await pool.query(statement);
}

async function migrateColumns() {
  for (const m of COLUMN_MIGRATIONS) {
    const exists = await queryOne(
      `SELECT 1 AS ok FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
      { table: m.table, column: m.column }
    );
    if (!exists) await pool.query(m.ddl);
  }
  const col = await queryOne(
    `SELECT DATA_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'problems' AND COLUMN_NAME = 'test_cases_json'`
  );
  if (col && col.type.toLowerCase() === 'text') await pool.query('ALTER TABLE problems MODIFY test_cases_json MEDIUMTEXT');
}

async function getMeta(key) {
  const row = await queryOne('SELECT meta_value AS value FROM app_meta WHERE meta_key = :key', { key });
  return row?.value ?? null;
}

async function setMeta(key, value) {
  await query('INSERT INTO app_meta (meta_key, meta_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE meta_value = :value', { key, value });
}

async function seedUsers() {
  for (const u of DEMO_USERS) {
    const exists = await queryOne('SELECT id FROM users WHERE email = :email', { email: u.email });
    if (exists) continue;
    const hash = await bcrypt.hash(u.password, 10);
    await query('INSERT INTO users (name, email, password, role) VALUES (:name, :email, :hash, :role)', { ...u, hash });
  }
}

const PROBLEM_FIELDS = `
  title = :title, description = :description, category = :category, difficulty = :difficulty, tags = :tags,
  input_format = :inputFormat, output_format = :outputFormat, constraints_text = :constraintsText,
  sample_input = :sampleInput, sample_output = :sampleOutput, explanation = :explanation,
  java_solution = :javaSolution, default_code_template = :defaultCodeTemplate, driver_code = :driverCode,
  param_names = :paramNames, test_cases_json = :testCasesJson,
  time_complexity = :timeComplexity, space_complexity = :spaceComplexity`;

/**
 * Keep the built-in problem bank in sync with problems.json.
 * Built-in problems are matched by slug; problems an admin created or edited (their slug gets an id suffix)
 * are never touched. Runs only when problems.json changes.
 */
async function syncProblemBank() {
  const raw = await readFile(PROBLEMS_PATH, 'utf8');
  const version = createHash('sha1').update(raw).digest('hex').slice(0, 12);
  if ((await getMeta('problem_bank_version')) === version) return { changed: false, inserted: 0, updated: 0 };

  const problems = JSON.parse(raw);
  let inserted = 0;
  let updated = 0;
  for (const p of problems) {
    const slug = slugify(p.title);
    const params = { ...p, slug };
    const existing = await queryOne('SELECT id FROM problems WHERE slug = :slug', { slug });
    if (existing) {
      await query(`UPDATE problems SET ${PROBLEM_FIELDS} WHERE id = :id`, { ...params, id: existing.id });
      updated++;
    } else {
      await query(`INSERT INTO problems SET slug = :slug, ${PROBLEM_FIELDS}`, params);
      inserted++;
    }
  }
  await setMeta('problem_bank_version', version);
  return { changed: true, inserted, updated };
}

/** Give the demo account some history so the dashboard is not empty on a fresh deploy. */
async function seedDemoActivity() {
  const user = await queryOne("SELECT id FROM users WHERE email = 'user@example.com'");
  if (!user) return;

  const problems = await query('SELECT id, java_solution AS code FROM problems ORDER BY id LIMIT 30');
  const hasProgress = await queryOne('SELECT COUNT(*) AS n FROM user_progress WHERE user_id = :userId', { userId: user.id });

  if (Number(hasProgress.n) === 0) {
    // [index into the first 30 problems, solved N days ago]
    const history = [
      [0, 0], [1, 1], [2, 2], [3, 3], [4, 5], [5, 6], [7, 9], [9, 12], [11, 13],
      [13, 17], [15, 20], [17, 24], [19, 26], [21, 31], [23, 38], [25, 45], [27, 52], [29, 60]
    ];
    for (const [index, days] of history) {
      if (!problems[index]) continue;
      await query(
        `INSERT IGNORE INTO user_progress (user_id, problem_id, status, solved_at)
         VALUES (:userId, :problemId, 'SOLVED', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL :days DAY))`,
        { userId: user.id, problemId: problems[index].id, days }
      );
    }
    const notes = [
      [problems[0]?.id, 'Only check divisors up to sqrt(n). Remember 1 is not prime.'],
      [problems[1]?.id, 'Two pointers from both ends, swap until they meet. O(1) extra space.'],
      [problems[5]?.id, 'HashMap of value -> index. For each x, check if target - x was already seen before storing x.']
    ];
    for (const [problemId, note] of notes) {
      if (problemId) await query('INSERT IGNORE INTO notes (user_id, problem_id, note) VALUES (:userId, :problemId, :note)', { userId: user.id, problemId, note });
    }
    for (const p of problems.slice(8, 12)) {
      await query("INSERT IGNORE INTO bookmarks (user_id, problem_id, tag) VALUES (:userId, :problemId, 'Revise Later')", { userId: user.id, problemId: p.id });
    }
  }

  // Matching submission history (a wrong attempt before some of the accepted ones)
  const hasSubs = await queryOne('SELECT COUNT(*) AS n FROM submissions WHERE user_id = :userId', { userId: user.id });
  if (Number(hasSubs.n) > 0) return;
  const solved = await query(
    `SELECT up.problem_id AS problemId, up.solved_at AS solvedAt, p.java_solution AS code, p.test_cases_json AS tests
     FROM user_progress up JOIN problems p ON p.id = up.problem_id WHERE up.user_id = :userId`,
    { userId: user.id }
  );
  for (const [i, s] of solved.entries()) {
    let total = 0;
    try {
      total = JSON.parse(s.tests || '[]').length;
    } catch {
      total = 0;
    }
    if (i % 3 === 1 && total > 2) {
      await query(
        `INSERT INTO submissions (user_id, problem_id, status, passed_count, total_count, runtime_ms, code, created_at)
         VALUES (:userId, :problemId, 'Wrong Answer', :passed, :total, NULL, :code, DATE_SUB(:solvedAt, INTERVAL 20 MINUTE))`,
        { userId: user.id, problemId: s.problemId, passed: Math.floor(total / 2), total, code: s.code || '', solvedAt: s.solvedAt }
      );
    }
    await query(
      `INSERT INTO submissions (user_id, problem_id, status, passed_count, total_count, runtime_ms, code, created_at)
       VALUES (:userId, :problemId, 'Accepted', :total, :total, :runtime, :code, :solvedAt)`,
      { userId: user.id, problemId: s.problemId, total, runtime: 3 + ((i * 7) % 40), code: s.code || '', solvedAt: s.solvedAt }
    );
  }
}

export async function setupDatabase({ log = true } = {}) {
  await ensureDatabaseExists();
  await createTables();
  await migrateColumns();
  await seedUsers();
  const sync = await syncProblemBank();
  if ((process.env.SEED_DEMO_ACTIVITY || 'true') !== 'false') await seedDemoActivity();
  if (log) {
    const { count } = await queryOne('SELECT COUNT(*) AS count FROM problems');
    const note = sync.changed ? ` - problem bank synced (${sync.inserted} added, ${sync.updated} updated)` : '';
    console.log(`Database ready: ${env.db.database} (${count} problems)${note}`);
  }
}
