import { query, queryOne } from '../config/db.js';
import { badRequest, notFound, parseId } from '../utils/http.js';
import { isoDate } from '../utils/sql.js';

const BOOKMARK_COLUMNS = `
  b.id, b.problem_id AS problemId, p.title AS problemTitle, p.category, p.difficulty, b.tag,
  ${isoDate('b.created_at', 'createdAt')}`;

// POST /api/bookmarks/:problemId  { tag? }
export async function addBookmark(req, res) {
  const problemId = parseId(req.params.problemId, 'problemId');
  const tag = String(req.body?.tag || '').trim() || 'Revise Later';
  if (tag.length > 100) throw badRequest('Tag must be 100 characters or fewer');

  const problem = await queryOne('SELECT id FROM problems WHERE id = :problemId', { problemId });
  if (!problem) throw notFound('Problem not found');

  await query(
    `INSERT INTO bookmarks (user_id, problem_id, tag) VALUES (:userId, :problemId, :tag)
     ON DUPLICATE KEY UPDATE tag = :tag`,
    { userId: req.user.id, problemId, tag }
  );

  const bookmark = await queryOne(
    `SELECT ${BOOKMARK_COLUMNS} FROM bookmarks b JOIN problems p ON p.id = b.problem_id
     WHERE b.user_id = :userId AND b.problem_id = :problemId`,
    { userId: req.user.id, problemId }
  );
  res.status(201).json(bookmark);
}

// GET /api/bookmarks
export async function listBookmarks(req, res) {
  const rows = await query(
    `SELECT ${BOOKMARK_COLUMNS} FROM bookmarks b JOIN problems p ON p.id = b.problem_id
     WHERE b.user_id = :userId ORDER BY b.created_at DESC`,
    { userId: req.user.id }
  );
  res.json(rows);
}

// GET /api/bookmarks/ids
export async function bookmarkIds(req, res) {
  const rows = await query('SELECT problem_id AS id FROM bookmarks WHERE user_id = :userId', { userId: req.user.id });
  res.json(rows.map((r) => Number(r.id)));
}

// DELETE /api/bookmarks/:problemId
export async function removeBookmark(req, res) {
  const problemId = parseId(req.params.problemId, 'problemId');
  const result = await query('DELETE FROM bookmarks WHERE user_id = :userId AND problem_id = :problemId', {
    userId: req.user.id,
    problemId
  });
  if (result.affectedRows === 0) throw notFound('Bookmark not found');
  res.status(204).end();
}
