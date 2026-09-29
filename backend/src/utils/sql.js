// Shared column lists. MySQL columns are snake_case; the API returns camelCase.

/** Format a DATETIME/TIMESTAMP column as an ISO-like string the browser can parse. */
export const isoDate = (column, alias) => `DATE_FORMAT(${column}, '%Y-%m-%dT%H:%i:%s') AS ${alias}`;

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
  p.default_code_template AS defaultCodeTemplate, p.test_cases_json AS testCasesJson`;

export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 180) || 'problem';
