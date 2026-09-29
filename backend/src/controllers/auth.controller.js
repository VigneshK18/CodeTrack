import bcrypt from 'bcryptjs';
import { query, queryOne } from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { badRequest, conflict, notFound, unauthorized } from '../utils/http.js';
import { isoDate } from '../utils/sql.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authResponse = (user) => ({
  token: signToken(user),
  userId: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

export async function register(req, res) {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const errors = {};
  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (Object.keys(errors).length) throw badRequest(Object.values(errors).join(', '), errors);

  const existing = await queryOne('SELECT id FROM users WHERE email = :email', { email });
  if (existing) throw conflict('Email already registered');

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :hash, 'USER')",
    { name, email, hash }
  );

  res.status(201).json(authResponse({ id: result.insertId, name, email, role: 'USER' }));
}

export async function login(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) throw badRequest('Email and password are required');

  const user = await queryOne('SELECT id, name, email, role, password FROM users WHERE email = :email', { email });
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw unauthorized('Invalid email or password');

  res.json(authResponse(user));
}

export async function profile(req, res) {
  const user = await queryOne(
    `SELECT id, name, email, role, ${isoDate('created_at', 'createdAt')} FROM users WHERE id = :id`,
    { id: req.user.id }
  );
  if (!user) throw notFound('User not found');

  const stats = await queryOne(
    `SELECT
       (SELECT COUNT(*) FROM user_progress WHERE user_id = :id AND status = 'SOLVED') AS solvedCount,
       (SELECT COUNT(*) FROM notes WHERE user_id = :id) AS notesCount,
       (SELECT COUNT(*) FROM bookmarks WHERE user_id = :id) AS bookmarksCount`,
    { id: req.user.id }
  );

  res.json({
    ...user,
    solvedCount: Number(stats.solvedCount),
    notesCount: Number(stats.notesCount),
    bookmarksCount: Number(stats.bookmarksCount)
  });
}
