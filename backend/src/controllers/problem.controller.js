import { query, queryOne } from '../config/db.js';
import { badRequest, notFound, parseId } from '../utils/http.js';
import { PROBLEM_DETAIL_COLUMNS, PROBLEM_SUMMARY_COLUMNS, parseTestCases, slugify } from '../utils/sql.js';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Acceptance statistics per problem, joined onto problem queries.
const STATS_JOIN = `
  LEFT JOIN (
    SELECT problem_id, COUNT(*) AS total, SUM(status = 'Accepted') AS accepted
    FROM submissions GROUP BY problem_id
  ) s ON s.problem_id = p.id`;

const withStats = (row) => {
  const total = Number(row.totalSubmissions || 0);
  const accepted = Number(row.acceptedSubmissions || 0);
  return {
    ...row,
    totalSubmissions: total,
    acceptedSubmissions: accepted,
    acceptanceRate: total ? Math.round((accepted / total) * 1000) / 10 : null
  };
};

// GET /api/problems?q=&category=&difficulty=&page=0&size=10
export async function listProblems(req, res) {
  const page = Math.max(0, parseInt(req.query.page, 10) || 0);
  const size = Math.min(100, Math.max(1, parseInt(req.query.size, 10) || 10));
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const difficulty = String(req.query.difficulty || '').trim();

  const where = [];
  const params = { limit: size, offset: page * size };

  if (q) {
    // "12" or "12." matches problem number 12 as well as titles and tags
    where.push('(LOWER(p.title) LIKE :q OR LOWER(p.tags) LIKE :q OR p.id = :qid)');
    params.q = `%${q.toLowerCase()}%`;
    params.qid = Number(q.replace(/\.$/, '')) || -1;
  }
  if (category && category !== 'All') {
    where.push('p.category = :category');
    params.category = category;
  }
  if (difficulty && difficulty !== 'All') {
    where.push('p.difficulty = :difficulty');
    params.difficulty = difficulty;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM problems p ${whereSql}`, params);
  const rows = await query(
    `SELECT ${PROBLEM_SUMMARY_COLUMNS}, s.total AS totalSubmissions, s.accepted AS acceptedSubmissions
     FROM problems p ${STATS_JOIN} ${whereSql} ORDER BY p.id ASC LIMIT :limit OFFSET :offset`,
    params
  );

  const totalElements = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  res.json({
    content: rows.map(withStats),
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    last: page >= totalPages - 1
  });
}

// GET /api/problems/categories
export async function listCategories(req, res) {
  const rows = await query(
    "SELECT DISTINCT category FROM problems WHERE category IS NOT NULL AND category <> '' ORDER BY category"
  );
  res.json(rows.map((r) => r.category));
}

// GET /api/problems/random
export async function randomProblem(req, res) {
  const row = await queryOne('SELECT id FROM problems ORDER BY RAND() LIMIT 1');
  if (!row) throw notFound('No problems yet');
  res.json({ id: Number(row.id) });
}

// GET /api/problems/:id  (admins also get hidden test cases and the driver code)
export async function getProblem(req, res) {
  const id = parseId(req.params.id);
  const problem = await queryOne(
    `SELECT ${PROBLEM_DETAIL_COLUMNS}, s.total AS totalSubmissions, s.accepted AS acceptedSubmissions
     FROM problems p ${STATS_JOIN} WHERE p.id = :id`,
    { id }
  );
  if (!problem) throw notFound('Problem not found');

  const [prev, next] = await Promise.all([
    queryOne('SELECT MAX(id) AS id FROM problems WHERE id < :id', { id }),
    queryOne('SELECT MIN(id) AS id FROM problems WHERE id > :id', { id })
  ]);

  const tests = parseTestCases(problem.testCasesJson);
  const examples = tests.filter((t) => !t.hidden);
  const isAdmin = req.user?.role === 'ADMIN';

  const body = withStats({
    ...problem,
    examples,
    testCaseCount: tests.length,
    hiddenTestCount: tests.length - examples.length,
    prevId: prev?.id ? Number(prev.id) : null,
    nextId: next?.id ? Number(next.id) : null
  });

  if (!isAdmin) {
    delete body.testCasesJson; // hidden tests never leave the server for students
    delete body.driverCode;
  }
  res.json(body);
}

function readProblemBody(body = {}) {
  const text = (key, max) => {
    const value = body[key] == null ? null : String(body[key]);
    if (value && max && value.length > max) throw badRequest(`${key} must be ${max} characters or fewer`);
    return value;
  };

  const data = {
    title: (text('title', 200) || '').trim(),
    description: text('description'),
    category: (text('category', 100) || '').trim() || null,
    difficulty: text('difficulty') || 'Easy',
    tags: text('tags', 255),
    inputFormat: text('inputFormat'),
    outputFormat: text('outputFormat'),
    constraintsText: text('constraintsText'),
    sampleInput: text('sampleInput'),
    sampleOutput: text('sampleOutput'),
    explanation: text('explanation'),
    javaSolution: text('javaSolution'),
    defaultCodeTemplate: text('defaultCodeTemplate'),
    driverCode: (text('driverCode') || '').trim() || null,
    paramNames: (text('paramNames', 255) || '').trim() || null,
    testCasesJson: (text('testCasesJson') || '').trim() || '[]',
    timeComplexity: text('timeComplexity', 100),
    spaceComplexity: text('spaceComplexity', 100)
  };

  const errors = {};
  if (!data.title) errors.title = 'Title is required';
  if (!DIFFICULTIES.includes(data.difficulty)) errors.difficulty = 'Difficulty must be Easy, Medium or Hard';

  try {
    const tests = JSON.parse(data.testCasesJson);
    const valid = Array.isArray(tests) && tests.every((t) => t && typeof t.input === 'string' && typeof t.output === 'string');
    if (!valid) throw new Error();
    // keep the first visible example in the legacy sample columns
    const first = tests.find((t) => !t.hidden);
    if (first && !data.sampleInput) {
      data.sampleInput = first.input;
      data.sampleOutput = first.output;
    }
  } catch {
    errors.testCasesJson = 'Test cases must be a JSON array like [{"input": "5", "output": "120", "hidden": false}]';
  }
  if (data.driverCode && !/class\s+CodeTrackDriver\b/.test(data.driverCode)) {
    errors.driverCode = 'Driver code must declare public class CodeTrackDriver';
  }

  if (Object.keys(errors).length) throw badRequest(Object.values(errors).join(', '), errors);
  return data;
}

const WRITE_COLUMNS = `
  title = :title, slug = :slug, description = :description, category = :category,
  difficulty = :difficulty, tags = :tags, input_format = :inputFormat, output_format = :outputFormat,
  constraints_text = :constraintsText, sample_input = :sampleInput, sample_output = :sampleOutput,
  explanation = :explanation, java_solution = :javaSolution, default_code_template = :defaultCodeTemplate,
  driver_code = :driverCode, param_names = :paramNames,
  test_cases_json = :testCasesJson, time_complexity = :timeComplexity, space_complexity = :spaceComplexity`;

const loadFull = (id) => queryOne(`SELECT ${PROBLEM_DETAIL_COLUMNS} FROM problems p WHERE p.id = :id`, { id });

// POST /api/problems (admin)
export async function createProblem(req, res) {
  const data = readProblemBody(req.body);
  const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
  const result = await query(`INSERT INTO problems SET ${WRITE_COLUMNS}`, { ...data, slug });
  res.status(201).json(await loadFull(result.insertId));
}

// PUT /api/problems/:id (admin)
export async function updateProblem(req, res) {
  const id = parseId(req.params.id);
  const exists = await queryOne('SELECT id FROM problems WHERE id = :id', { id });
  if (!exists) throw notFound('Problem not found');

  const data = readProblemBody(req.body);
  // the id suffix marks the problem as admin-edited, so the built-in bank sync leaves it alone
  const slug = `${slugify(data.title)}-${id}`;
  await query(`UPDATE problems SET ${WRITE_COLUMNS} WHERE id = :id`, { ...data, slug, id });
  res.json(await loadFull(id));
}

// DELETE /api/problems/:id (admin) - progress, notes, bookmarks and submissions cascade in MySQL
export async function deleteProblem(req, res) {
  const id = parseId(req.params.id);
  const result = await query('DELETE FROM problems WHERE id = :id', { id });
  if (result.affectedRows === 0) throw notFound('Problem not found');
  res.status(204).end();
}
