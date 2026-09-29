import { query, queryOne } from '../config/db.js';
import { badRequest, notFound, parseId } from '../utils/http.js';
import { PROBLEM_DETAIL_COLUMNS, PROBLEM_SUMMARY_COLUMNS, slugify } from '../utils/sql.js';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

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
    where.push('(LOWER(p.title) LIKE :q OR LOWER(p.tags) LIKE :q)');
    params.q = `%${q.toLowerCase()}%`;
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
  const content = await query(
    `SELECT ${PROBLEM_SUMMARY_COLUMNS} FROM problems p ${whereSql} ORDER BY p.id ASC LIMIT :limit OFFSET :offset`,
    params
  );

  const totalElements = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  res.json({
    content,
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

// GET /api/problems/:id
export async function getProblem(req, res) {
  const id = parseId(req.params.id);
  const problem = await queryOne(`SELECT ${PROBLEM_DETAIL_COLUMNS} FROM problems p WHERE p.id = :id`, { id });
  if (!problem) throw notFound('Problem not found');
  res.json(problem);
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
  } catch {
    errors.testCasesJson = 'Test cases must be a JSON array like [{"input": "5", "output": "120"}]';
  }

  if (Object.keys(errors).length) throw badRequest(Object.values(errors).join(', '), errors);
  return data;
}

const WRITE_COLUMNS = `
  title = :title, slug = :slug, description = :description, category = :category,
  difficulty = :difficulty, tags = :tags, input_format = :inputFormat, output_format = :outputFormat,
  constraints_text = :constraintsText, sample_input = :sampleInput, sample_output = :sampleOutput,
  explanation = :explanation, java_solution = :javaSolution, default_code_template = :defaultCodeTemplate,
  test_cases_json = :testCasesJson, time_complexity = :timeComplexity, space_complexity = :spaceComplexity`;

// POST /api/problems (admin)
export async function createProblem(req, res) {
  const data = readProblemBody(req.body);
  const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
  const result = await query(`INSERT INTO problems SET ${WRITE_COLUMNS}`, { ...data, slug });
  const problem = await queryOne(`SELECT ${PROBLEM_DETAIL_COLUMNS} FROM problems p WHERE p.id = :id`, { id: result.insertId });
  res.status(201).json(problem);
}

// PUT /api/problems/:id (admin)
export async function updateProblem(req, res) {
  const id = parseId(req.params.id);
  const exists = await queryOne('SELECT id FROM problems WHERE id = :id', { id });
  if (!exists) throw notFound('Problem not found');

  const data = readProblemBody(req.body);
  const slug = `${slugify(data.title)}-${id}`;
  await query(`UPDATE problems SET ${WRITE_COLUMNS} WHERE id = :id`, { ...data, slug, id });
  const problem = await queryOne(`SELECT ${PROBLEM_DETAIL_COLUMNS} FROM problems p WHERE p.id = :id`, { id });
  res.json(problem);
}

// DELETE /api/problems/:id (admin) - progress, notes and bookmarks cascade in MySQL
export async function deleteProblem(req, res) {
  const id = parseId(req.params.id);
  const result = await query('DELETE FROM problems WHERE id = :id', { id });
  if (result.affectedRows === 0) throw notFound('Problem not found');
  res.status(204).end();
}
