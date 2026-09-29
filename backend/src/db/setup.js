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

async function seedUsers() {
  for (const u of DEMO_USERS) {
    const exists = await queryOne('SELECT id FROM users WHERE email = :email', { email: u.email });
    if (exists) continue;
    const hash = await bcrypt.hash(u.password, 10);
    await query('INSERT INTO users (name, email, password, role) VALUES (:name, :email, :hash, :role)', { ...u, hash });
  }
}

async function seedProblems() {
  const { count } = await queryOne('SELECT COUNT(*) AS count FROM problems');
  if (Number(count) > 0) return false; // only seed an empty library, so admin edits and deletions stick

  const problems = JSON.parse(await readFile(PROBLEMS_PATH, 'utf8'));
  for (const p of problems) {
    await query(
      `INSERT INTO problems
        (title, slug, description, category, difficulty, tags, input_format, output_format, constraints_text,
         sample_input, sample_output, explanation, java_solution, default_code_template, test_cases_json,
         time_complexity, space_complexity)
       VALUES
        (:title, :slug, :description, :category, :difficulty, :tags, :inputFormat, :outputFormat, :constraintsText,
         :sampleInput, :sampleOutput, :explanation, :javaSolution, :defaultCodeTemplate, :testCasesJson,
         :timeComplexity, :spaceComplexity)`,
      { ...p, slug: slugify(p.title), testCasesJson: p.testCasesJson || '[]', defaultCodeTemplate: p.defaultCodeTemplate || null }
    );
  }
  return true;
}

/** Give the demo account some history so the dashboard is not empty on a fresh deploy. */
async function seedDemoActivity() {
  const user = await queryOne("SELECT id FROM users WHERE email = 'user@example.com'");
  if (!user) return;

  const problems = await query('SELECT id FROM problems ORDER BY id LIMIT 30');
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

export async function setupDatabase({ log = true } = {}) {
  await ensureDatabaseExists();
  await createTables();
  await seedUsers();
  const seeded = await seedProblems();
  if (seeded && (process.env.SEED_DEMO_ACTIVITY || 'true') !== 'false') await seedDemoActivity();
  if (log) {
    const { count } = await queryOne('SELECT COUNT(*) AS count FROM problems');
    console.log(`Database ready: ${env.db.database} (${count} problems)${seeded ? ' - seeded demo data' : ''}`);
  }
}
