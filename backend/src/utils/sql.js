// Shared column lists. MySQL columns are snake_case; the API returns camelCase.

import { env } from '../config/env.js';

const TZ_SUFFIX = env.db.timeZone === '+00:00' ? 'Z' : env.db.timeZone;

/** Format a TIMESTAMP column as an ISO 8601 string with its offset, so browsers show the right local time. */
export const isoDate = (column, alias) => `CONCAT(DATE_FORMAT(${column}, '%Y-%m-%dT%H:%i:%s'), '${TZ_SUFFIX}') AS ${alias}`;

// Columns returned in problem lists (lighter: no code template or hidden test cases).
export const PROBLEM_SUMMARY_COLUMNS = `
  p.id, p.title, p.slug, p.description, p.category, p.difficulty, p.tags,
  p.input_format AS inputFormat, p.output_format AS outputFormat,
  p.constraints_text AS constraintsText, p.sample_input AS sampleInput,
  p.sample_output AS sampleOutput, p.explanation, p.java_solution AS javaSolution,
  p.time_complexity AS timeComplexity, p.space_complexity AS spaceComplexity,
  ${isoDate('p.created_at', 'createdAt')}`;

// Columns returned for a single problem.
export const PROBLEM_DETAIL_COLUMNS = `${PROBLEM_SUMMARY_COLUMNS},
  p.default_code_template AS defaultCodeTemplate, p.test_cases_json AS testCasesJson,
  p.driver_code AS driverCode, p.param_names AS paramNames`;

/** Parse a problem's stored test cases: [{ input, output, hidden?, explanation? }]. */
export function parseTestCases(json) {
  try {
    const tests = JSON.parse(json || '[]');
    return Array.isArray(tests) ? tests.filter((t) => t && typeof t.input === 'string' && typeof t.output === 'string') : [];
  } catch {
    return [];
  }
}

export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 180) || 'problem';
