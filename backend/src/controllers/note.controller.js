import { query, queryOne } from '../config/db.js';
import { badRequest, notFound, parseId } from '../utils/http.js';
import { isoDate } from '../utils/sql.js';

const NOTE_COLUMNS = `
  n.id, n.problem_id AS problemId, p.title AS problemTitle, p.category, p.difficulty, n.note,
  ${isoDate('n.updated_at', 'updatedAt')}`;

const findNote = (userId, problemId) =>
  queryOne(
    `SELECT ${NOTE_COLUMNS} FROM notes n JOIN problems p ON p.id = n.problem_id
     WHERE n.user_id = :userId AND n.problem_id = :problemId`,
    { userId, problemId }
  );

// POST /api/notes/:problemId  { note }
export async function saveNote(req, res) {
  const problemId = parseId(req.params.problemId, 'problemId');
  const note = String(req.body?.note ?? '');
  if (note.length > 20000) throw badRequest('Note must be 20,000 characters or fewer');

  const problem = await queryOne('SELECT id FROM problems WHERE id = :problemId', { problemId });
  if (!problem) throw notFound('Problem not found');

  await query(
    `INSERT INTO notes (user_id, problem_id, note) VALUES (:userId, :problemId, :note)
     ON DUPLICATE KEY UPDATE note = :note, updated_at = CURRENT_TIMESTAMP`,
    { userId: req.user.id, problemId, note }
  );

  res.json(await findNote(req.user.id, problemId));
}

// GET /api/notes/:problemId
export async function getNote(req, res) {
  const problemId = parseId(req.params.problemId, 'problemId');
  const note = await findNote(req.user.id, problemId);
  if (!note) throw notFound('Note not found');
  res.json(note);
}

// GET /api/notes
export async function listNotes(req, res) {
  const notes = await query(
    `SELECT ${NOTE_COLUMNS} FROM notes n JOIN problems p ON p.id = n.problem_id
     WHERE n.user_id = :userId ORDER BY n.updated_at DESC`,
    { userId: req.user.id }
  );
  res.json(notes);
}

// DELETE /api/notes/:problemId
export async function deleteNote(req, res) {
  const problemId = parseId(req.params.problemId, 'problemId');
  const result = await query('DELETE FROM notes WHERE user_id = :userId AND problem_id = :problemId', {
    userId: req.user.id,
    problemId
  });
  if (result.affectedRows === 0) throw notFound('Note not found');
  res.status(204).end();
}
