import { query, queryOne } from '../config/db.js';
import { isoDate } from '../utils/sql.js';

/** Insert or refresh a SOLVED row for this user/problem. Used by the code runner too. */
export async function markProblemSolved(userId, problemId) {
  await query(
    `INSERT INTO user_progress (user_id, problem_id, status, solved_at)
     VALUES (:userId, :problemId, 'SOLVED', CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE status = 'SOLVED', solved_at = CURRENT_TIMESTAMP`,
    { userId, problemId }
  );
}

// GET /api/progress/solved-ids
export async function solvedIds(req, res) {
  const rows = await query(
    "SELECT problem_id AS id FROM user_progress WHERE user_id = :userId AND status = 'SOLVED'",
    { userId: req.user.id }
  );
  res.json(rows.map((r) => Number(r.id)));
}

// GET /api/progress/statuses -> { solved: [ids], attempted: [ids] } (attempted = submitted but never accepted)
export async function statuses(req, res) {
  const [solved, attempted] = await Promise.all([
    query("SELECT problem_id AS id FROM user_progress WHERE user_id = :userId AND status = 'SOLVED'", { userId: req.user.id }),
    query(
      `SELECT DISTINCT s.problem_id AS id FROM submissions s
       WHERE s.user_id = :userId
         AND NOT EXISTS (SELECT 1 FROM user_progress up WHERE up.user_id = s.user_id AND up.problem_id = s.problem_id AND up.status = 'SOLVED')`,
      { userId: req.user.id }
    )
  ]);
  res.json({ solved: solved.map((r) => Number(r.id)), attempted: attempted.map((r) => Number(r.id)) });
}

/** Count consecutive days (ending today, or yesterday if nothing solved today). */
export function calculateStreak(dates, today) {
  const set = new Set(dates);
  const day = new Date(`${today}T00:00:00Z`);
  const key = () => day.toISOString().slice(0, 10);

  if (!set.has(key())) day.setUTCDate(day.getUTCDate() - 1);

  let streak = 0;
  while (set.has(key())) {
    streak += 1;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive days in a sorted list of YYYY-MM-DD strings. */
export function calculateLongestStreak(sortedDates) {
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of sortedDates) {
    const current = new Date(`${d}T00:00:00Z`);
    run = prev && current - prev === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = current;
  }
  return best;
}

// GET /api/progress/stats
export async function stats(req, res) {
  const userId = req.user.id;

  const [totals, byDifficulty, difficultyTotals, categoryTotals, categorySolved, dateRows, recent, todayRow] = await Promise.all([
    queryOne(
      `SELECT (SELECT COUNT(*) FROM problems) AS totalProblems,
              (SELECT COUNT(*) FROM user_progress WHERE user_id = :userId AND status = 'SOLVED') AS solvedProblems`,
      { userId }
    ),
    query(
      `SELECT p.difficulty, COUNT(*) AS solved
       FROM user_progress up JOIN problems p ON p.id = up.problem_id
       WHERE up.user_id = :userId AND up.status = 'SOLVED'
       GROUP BY p.difficulty`,
      { userId }
    ),
    query('SELECT difficulty, COUNT(*) AS total FROM problems GROUP BY difficulty'),
    query(
      `SELECT COALESCE(NULLIF(category, ''), 'Uncategorized') AS category, COUNT(*) AS total
       FROM problems GROUP BY 1 ORDER BY 1`
    ),
    query(
      `SELECT COALESCE(NULLIF(p.category, ''), 'Uncategorized') AS category, COUNT(*) AS solved
       FROM user_progress up JOIN problems p ON p.id = up.problem_id
       WHERE up.user_id = :userId AND up.status = 'SOLVED'
       GROUP BY 1 ORDER BY 1`,
      { userId }
    ),
    // activity = submissions per day (like LeetCode's heatmap); users without submissions fall back to solve dates
    query(
      `SELECT day, SUM(n) AS solved FROM (
         SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS n FROM submissions WHERE user_id = :userId GROUP BY day
         UNION ALL
         SELECT DATE_FORMAT(solved_at, '%Y-%m-%d') AS day, 1 AS n FROM user_progress up
         WHERE up.user_id = :userId AND up.status = 'SOLVED'
           AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.user_id = :userId)
       ) t GROUP BY day ORDER BY day`,
      { userId }
    ),
    query(
      `SELECT p.id, p.title, p.difficulty, ${isoDate('up.solved_at', 'solvedAt')}
       FROM user_progress up JOIN problems p ON p.id = up.problem_id
       WHERE up.user_id = :userId AND up.status = 'SOLVED'
       ORDER BY up.solved_at DESC LIMIT 5`,
      { userId }
    ),
    queryOne(
      `SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS today,
              (SELECT COUNT(*) FROM submissions WHERE user_id = :userId) AS totalSubmissions,
              (SELECT COUNT(*) FROM submissions WHERE user_id = :userId AND status = 'Accepted') AS acceptedSubmissions`,
      { userId }
    )
  ]);

  const solvedFor = (level) => Number(byDifficulty.find((r) => r.difficulty === level)?.solved || 0);
  const toMap = (rows, key) => Object.fromEntries(rows.map((r) => [r.category, Number(r[key])]));
  const submissionDates = dateRows.map((r) => r.day);

  res.json({
    totalProblems: Number(totals.totalProblems),
    solvedProblems: Number(totals.solvedProblems),
    difficultyTotals: Object.fromEntries(['Easy', 'Medium', 'Hard'].map((d) => [d, Number(difficultyTotals.find((r) => r.difficulty === d)?.total || 0)])),
    easySolved: solvedFor('Easy'),
    mediumSolved: solvedFor('Medium'),
    hardSolved: solvedFor('Hard'),
    currentStreak: calculateStreak(submissionDates, todayRow.today),
    longestStreak: calculateLongestStreak(submissionDates),
    categoryTotals: toMap(categoryTotals, 'total'),
    categorySolved: toMap(categorySolved, 'solved'),
    recentActivities: recent.map((r) => ({ ...r, id: Number(r.id) })),
    submissionDates,
    activityCounts: Object.fromEntries(dateRows.map((r) => [r.day, Number(r.solved)])),
    totalSubmissions: Number(todayRow.totalSubmissions),
    acceptedSubmissions: Number(todayRow.acceptedSubmissions)
  });
}
