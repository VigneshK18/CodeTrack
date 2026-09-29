import { query, queryOne } from '../config/db.js';
import { normalizeOutput, runJudge, sourceFileName } from '../services/judge.js';
import { markProblemSolved } from './progress.controller.js';
import { HttpError, badRequest, forbidden, notFound, parseId } from '../utils/http.js';
import { isoDate, parseTestCases } from '../utils/sql.js';

const MAX_CODE_LENGTH = 50_000;
const MAX_CUSTOM_CASES = 10;
const MAX_INPUT_LENGTH = 100_000;

const STATUS = {
  OK: 'Accepted',
  WA: 'Wrong Answer',
  RE: 'Runtime Error',
  TLE: 'Time Limit Exceeded',
  CE: 'Compilation Error'
};

function readCode(body) {
  const code = String(body?.code || '');
  if (!code.trim()) throw badRequest('Code cannot be empty');
  if (code.length > MAX_CODE_LENGTH) throw badRequest('Code is too long (max 50,000 characters)');
  return code;
}

async function loadProblem(problemId) {
  const problem = await queryOne(
    `SELECT id, java_solution AS javaSolution, driver_code AS driverCode, test_cases_json AS testCasesJson
     FROM problems WHERE id = :problemId`,
    { problemId }
  );
  if (!problem) throw notFound('Problem not found');
  return { ...problem, tests: parseTestCases(problem.testCasesJson) };
}

/** Turn javac diagnostics into LeetCode-style "Line N: error: ..." text. */
function formatCompileErrors(errors, code) {
  const userFile = sourceFileName(code);
  const lines = (errors || []).map((e) => {
    if (e.file === 'CodeTrackDriver.java') return `Driver error: ${e.message}\n(Keep the class name and method signature from the starter code.)`;
    if (e.file && e.file !== userFile) return `${e.file}, line ${e.line}: error: ${e.message}`;
    return `Line ${e.line}: error: ${e.message}`;
  });
  return lines.join('\n\n') || 'Compilation failed';
}

/** What the program "answered": the driver's return value, or stdout for full-program problems. */
function answerOf(rec, hasDriver) {
  if (!rec) return { output: null, stdout: '' };
  return hasDriver ? { output: rec.result, stdout: rec.stdout } : { output: rec.stdout, stdout: '' };
}

function judgeCase(rec, expected, hasDriver) {
  if (!rec) return { status: 'Not Run', passed: false };
  if (rec.status === 'TLE') return { status: STATUS.TLE, passed: false };
  if (rec.status === 'RE') return { status: STATUS.RE, passed: false, error: rec.error };
  const { output } = answerOf(rec, hasDriver);
  if (output == null) return { status: STATUS.RE, passed: false, error: 'Your code did not produce a result' };
  if (expected == null) return { status: STATUS.OK, passed: null };
  const passed = normalizeOutput(output) === normalizeOutput(expected);
  return { status: passed ? STATUS.OK : STATUS.WA, passed };
}

function judgeFailure(result) {
  const detail = result.detail ? `: ${result.detail.split('\n')[0]}` : '';
  return new HttpError(503, `The judge could not run your code${detail}`);
}

// POST /api/execution/run  { problemId, code, inputs? }  -> runs the examples (or custom inputs), nothing is saved
export async function runCode(req, res) {
  const code = readCode(req.body);
  const problem = await loadProblem(parseId(req.body?.problemId, 'problemId'));
  const hasDriver = Boolean(problem.driverCode);

  let inputs = Array.isArray(req.body?.inputs) ? req.body.inputs.map((x) => String(x ?? '')) : [];
  if (!inputs.length) inputs = problem.tests.filter((t) => !t.hidden).map((t) => t.input);
  if (!inputs.length) inputs = [''];
  if (inputs.length > MAX_CUSTOM_CASES) throw badRequest(`At most ${MAX_CUSTOM_CASES} test cases can be run at once`);
  if (inputs.some((x) => x.length > MAX_INPUT_LENGTH)) throw badRequest('A test case input is too large');

  // Known inputs already have expected output; anything else is computed by the reference solution.
  const known = new Map(problem.tests.map((t) => [normalizeOutput(t.input), t.output]));
  const expected = inputs.map((input) => known.get(normalizeOutput(input)) ?? null);
  const refIndexes = problem.javaSolution ? expected.map((e, i) => (e == null ? i : -1)).filter((i) => i >= 0) : [];

  const result = await runJudge({ code, driverCode: problem.driverCode, inputs, refCode: problem.javaSolution, refIndexes });
  if (result.crashed) throw judgeFailure(result);
  if (!result.compile.ok) {
    return res.json({ status: STATUS.CE, compileError: formatCompileErrors(result.compile.errors, code), cases: [] });
  }

  let runtimeMs = 0;
  const cases = inputs.map((input, i) => {
    const rec = result.user[i];
    const ref = result.ref[i];
    let exp = expected[i];
    let expectedError = null;
    if (exp == null && ref) {
      if (ref.status === 'OK') exp = answerOf(ref, hasDriver).output;
      else expectedError = ref.status === 'RE' ? `Invalid input: ${ref.error.split('\n')[0]}` : 'The reference solution timed out on this input';
    }
    const verdict = judgeCase(rec, exp, hasDriver);
    runtimeMs += rec?.cpuMs || 0;
    return {
      input,
      ...answerOf(rec, hasDriver),
      expected: exp,
      expectedError,
      runtimeMs: rec?.cpuMs ?? null,
      ...verdict
    };
  });

  const failed = cases.find((c) => c.status !== STATUS.OK || c.passed === false);
  res.json({ status: failed ? failed.status : STATUS.OK, cases, runtimeMs });
}

// POST /api/submissions  { problemId, code }  -> judges every test case (hidden ones too) and saves the result
export async function submitCode(req, res) {
  const code = readCode(req.body);
  const problem = await loadProblem(parseId(req.body?.problemId, 'problemId'));
  const hasDriver = Boolean(problem.driverCode);
  const tests = problem.tests;
  if (!tests.length) throw badRequest('This problem has no test cases yet, so it cannot be submitted');

  const result = await runJudge({ code, driverCode: problem.driverCode, inputs: tests.map((t) => t.input) });
  if (result.crashed) throw judgeFailure(result);

  let status = STATUS.OK;
  let passedCount = 0;
  let runtimeMs = 0;
  let failedCase = null;
  let compileError = null;

  if (!result.compile.ok) {
    status = STATUS.CE;
    compileError = formatCompileErrors(result.compile.errors, code);
  } else {
    tests.forEach((t, i) => {
      const rec = result.user[i];
      const verdict = judgeCase(rec, t.output, hasDriver);
      runtimeMs += rec?.cpuMs || 0;
      if (verdict.passed) {
        passedCount++;
        return;
      }
      if (failedCase) return; // report the first failure, like LeetCode
      status = verdict.status === 'Not Run' ? STATUS.TLE : verdict.status;
      const answer = answerOf(rec, hasDriver);
      failedCase = {
        index: i,
        hidden: Boolean(t.hidden),
        status,
        error: verdict.error || null,
        // inputs and outputs of hidden tests stay secret
        ...(t.hidden ? {} : { input: t.input, expected: t.output, output: answer.output, stdout: answer.stdout })
      };
    });
  }

  const accepted = status === STATUS.OK;
  const insert = await query(
    `INSERT INTO submissions (user_id, problem_id, status, passed_count, total_count, runtime_ms, code)
     VALUES (:userId, :problemId, :status, :passedCount, :totalCount, :runtimeMs, :code)`,
    { userId: req.user.id, problemId: problem.id, status, passedCount, totalCount: tests.length, runtimeMs: accepted ? runtimeMs : null, code }
  );
  if (accepted) await markProblemSolved(req.user.id, problem.id);

  let beats = null;
  if (accepted) {
    const row = await queryOne(
      `SELECT COUNT(*) AS total, SUM(runtime_ms > :runtimeMs) AS slower FROM submissions
       WHERE problem_id = :problemId AND status = 'Accepted' AND id <> :id AND runtime_ms IS NOT NULL`,
      { problemId: problem.id, runtimeMs, id: insert.insertId }
    );
    const total = Number(row.total);
    beats = total ? Math.round((Number(row.slower) / total) * 1000) / 10 : 100;
  }

  res.status(201).json({
    id: insert.insertId,
    status,
    passedCount,
    totalCount: tests.length,
    runtimeMs: accepted ? runtimeMs : null,
    beats,
    failedCase,
    compileError
  });
}

const SUBMISSION_COLUMNS = `
  s.id, s.problem_id AS problemId, p.title AS problemTitle, s.status, s.passed_count AS passedCount,
  s.total_count AS totalCount, s.runtime_ms AS runtimeMs, s.language, ${isoDate('s.created_at', 'createdAt')}`;

// GET /api/submissions?problemId=&limit=
export async function listSubmissions(req, res) {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const params = { userId: req.user.id, limit };
  let filter = '';
  if (req.query.problemId) {
    params.problemId = parseId(req.query.problemId, 'problemId');
    filter = 'AND s.problem_id = :problemId';
  }
  const rows = await query(
    `SELECT ${SUBMISSION_COLUMNS} FROM submissions s JOIN problems p ON p.id = s.problem_id
     WHERE s.user_id = :userId ${filter} ORDER BY s.created_at DESC, s.id DESC LIMIT :limit`,
    params
  );
  res.json(rows.map((r) => ({ ...r, id: Number(r.id), problemId: Number(r.problemId) })));
}

// GET /api/submissions/:id  (the owner or an admin)
export async function getSubmission(req, res) {
  const id = parseId(req.params.id);
  const row = await queryOne(
    `SELECT ${SUBMISSION_COLUMNS}, s.user_id AS userId, s.code FROM submissions s JOIN problems p ON p.id = s.problem_id WHERE s.id = :id`,
    { id }
  );
  if (!row) throw notFound('Submission not found');
  if (Number(row.userId) !== req.user.id && req.user.role !== 'ADMIN') throw forbidden('This is not your submission');
  delete row.userId;
  res.json({ ...row, id: Number(row.id), problemId: Number(row.problemId) });
}

// POST /api/execution/expected (admin)  { javaSolution, driverCode, inputs }  -> expected outputs for new test cases
export async function generateExpected(req, res) {
  const code = String(req.body?.javaSolution || '');
  if (!code.trim()) throw badRequest('Add a reference Java solution first');
  const driverCode = String(req.body?.driverCode || '').trim() || null;
  const inputs = Array.isArray(req.body?.inputs) ? req.body.inputs.map((x) => String(x ?? '')) : [];
  if (!inputs.length) throw badRequest('Add at least one test case input');
  if (inputs.length > 50) throw badRequest('At most 50 inputs at a time');

  const result = await runJudge({ code, driverCode, inputs, timeLimitMs: 5000 });
  if (result.crashed) throw judgeFailure(result);
  if (!result.compile.ok) throw badRequest(`Reference solution does not compile:\n${formatCompileErrors(result.compile.errors, code)}`);

  res.json({
    outputs: inputs.map((_, i) => {
      const rec = result.user[i];
      if (!rec) return { output: null, error: 'Not run (an earlier case timed out)' };
      if (rec.status !== 'OK') return { output: null, error: rec.status === 'TLE' ? 'Time limit exceeded' : rec.error };
      return { output: answerOf(rec, Boolean(driverCode)).output, error: null };
    })
  });
}
