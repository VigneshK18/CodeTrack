// A year of daily solve counts, GitHub-style. One hue, light to dark = more problems solved.
const RAMP = ['#5641a3', '#7454dc', '#9272f7', '#c4b5fd'];
const EMPTY = 'rgba(255,255,255,0.05)';

const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function colorFor(count) {
  if (!count) return EMPTY;
  return RAMP[Math.min(count, RAMP.length) - 1];
}

export default function ActivityHeatmap({ counts = {} }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start on the Sunday 52 weeks ago so columns are whole weeks.
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7 - start.getDay());

  const weeks = [];
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      days.push(date);
    }
    weeks.push(days);
  }

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-[3px]" role="img" aria-label="Daily solved problems over the past year">
          {weeks.map((days, wi) => {
            const first = days[0];
            const showMonth = first.getDate() <= 7;
            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                <span className="h-4 whitespace-nowrap text-[10px] font-semibold text-slate-500">
                  {showMonth ? first.toLocaleString('en', { month: 'short' }) : ''}
                </span>
                {days.map((date) => {
                  const key = toKey(date);
                  const count = counts[key] || 0;
                  const future = date > today;
                  return (
                    <span
                      key={key}
                      title={future ? '' : `${date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} solved`}
                      className="h-3.5 w-3.5 rounded-[3px] transition hover:ring-2 hover:ring-white/40"
                      style={{ background: future ? 'transparent' : colorFor(count) }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-500">
        Less
        {[EMPTY, ...RAMP].map((c) => (
          <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
        ))}
        More
      </div>
    </div>
  );
}
