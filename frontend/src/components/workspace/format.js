// Helpers shared by the problem workspace panels.

export const paramList = (problem) =>
  (problem?.paramNames || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

/** Split a stored test input (one parameter per line) into values, padded to the parameter count. */
export function splitInput(input, params) {
  const lines = String(input ?? '').replace(/\r/g, '').split('\n');
  if (!params.length) return [lines.join('\n')];
  const values = params.map((_, i) => lines[i] ?? '');
  // any extra lines belong to the last parameter
  if (lines.length > params.length) values[params.length - 1] = lines.slice(params.length - 1).join('\n');
  return values;
}

export const joinInput = (values) => values.join('\n');

export const STATUS_STYLES = {
  Accepted: 'text-emerald-400',
  'Wrong Answer': 'text-rose-400',
  'Runtime Error': 'text-rose-400',
  'Time Limit Exceeded': 'text-rose-400',
  'Compilation Error': 'text-rose-400',
  'Not Run': 'text-slate-500'
};

export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}
