import { queryOne } from '../config/db.js';
import { runJava } from '../services/codeRunner.js';
import { markProblemSolved } from './progress.controller.js';
import { badRequest } from '../utils/http.js';

const MAX_CODE_LENGTH = 50_000;

function parseTestCases(json) {
  try {
    const tests = JSON.parse(json || '[]');
    return Array.isArray(tests) ? tests.filter((t) => t && typeof t.input === 'string' && typeof t.output === 'string') : [];
  } catch {
    return [];
  }
}

// POST /api/execution/run  { code, problemId?, input? }
export async function runCode(req, res) {
  const code = String(req.body?.code || '');
  const stdin = String(req.body?.input || '');
  if (!code.trim()) throw badRequest('Code cannot be empty');
  if (code.length > MAX_CODE_LENGTH) throw badRequest('Code is too long (max 50,000 characters)');

  const problemId = Number(req.body?.problemId) || null;
  const problem = problemId
    ? await queryOne('SELECT id, test_cases_json AS testCasesJson FROM problems WHERE id = :problemId', { problemId })
    : null;

  const testCases = parseTestCases(problem?.testCasesJson);
  const result = await runJava({ code, testCases, stdin });

  // Passing every stored test case marks the problem as solved for a logged-in user.
  result.markedSolved = false;
  if (req.user && problem && testCases.length > 0 && result.allPassed) {
    await markProblemSolved(req.user.id, problem.id);
    result.markedSolved = true;
  }

  res.json(result);
}
