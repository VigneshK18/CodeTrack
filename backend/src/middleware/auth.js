import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { queryOne } from '../config/db.js';
import { forbidden, unauthorized } from '../utils/http.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
}

async function resolveUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;

  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.jwt.secret);
  } catch {
    throw unauthorized('Session expired or invalid token. Please log in again.');
  }

  // Re-read the user so deleted accounts and role changes take effect immediately.
  const user = await queryOne('SELECT id, name, email, role FROM users WHERE id = :id', { id: Number(payload.sub) });
  if (!user) throw unauthorized('Account no longer exists. Please log in again.');
  return user;
}

/** Require a valid JWT. Sets req.user. */
export async function authenticate(req, res, next) {
  try {
    const user = await resolveUser(req);
    if (!user) throw unauthorized();
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Attach req.user when a valid token is present, otherwise continue as a guest. */
export async function optionalAuth(req, res, next) {
  try {
    req.user = await resolveUser(req);
  } catch {
    req.user = null;
  }
  next();
}

/** Must run after authenticate. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') return next(forbidden('Admin access required'));
  next();
}
