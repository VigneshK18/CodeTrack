import { Bookmark, CheckCircle2, CircleDashed, EyeOff, Tag } from 'lucide-react';
import RichText from '../RichText';
import { DifficultyBadge } from '../ui';
import { paramList, splitInput } from './format';

function ExampleBlock({ index, example, params }) {
  const values = splitInput(example.input, params);
  const inputText = params.length ? params.map((p, i) => `${p} = ${values[i]}`).join(', ') : example.input;
  return (
    <div className="mt-5">
      <p className="mb-2 font-bold text-white">Example {index + 1}:</p>
      <div className="space-y-1.5 border-l-2 border-white/10 pl-4 font-mono text-[13px] leading-relaxed">
        <p className="break-all"><span className="font-sans font-semibold text-white">Input: </span><span className="text-slate-300">{inputText}</span></p>
        <p className="break-all"><span className="font-sans font-semibold text-white">Output: </span><span className="text-slate-300">{example.output}</span></p>
        {example.explanation && (
          <p className="font-sans text-sm text-slate-300"><span className="font-semibold text-white">Explanation: </span>{example.explanation}</p>
        )}
      </div>
    </div>
  );
}

export default function DescriptionTab({ problem, solved, attempted, bookmarked, onToggleBookmark, canBookmark }) {
  const params = paramList(problem);
  const tags = (problem.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  const constraints = (problem.constraintsText || '').split('\n').map((c) => c.trim()).filter(Boolean);

  return (
    <article className="animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{problem.id}. {problem.title}</h1>
        {canBookmark && (
          <button
            onClick={onToggleBookmark}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
            aria-pressed={bookmarked}
            className={`shrink-0 rounded-xl border p-2 transition ${
              bookmarked ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark size={18} className={bookmarked ? 'fill-amber-400' : ''} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <DifficultyBadge level={problem.difficulty} />
        <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-0.5 text-slate-300"><Tag size={12} /> {problem.category}</span>
        {solved ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-0.5 font-semibold text-emerald-300"><CheckCircle2 size={14} /> Solved</span>
        ) : attempted ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-0.5 font-semibold text-amber-300"><CircleDashed size={14} /> Attempted</span>
        ) : null}
      </div>

      <RichText text={problem.description} className="mt-6" />

      {problem.examples?.map((ex, i) => <ExampleBlock key={i} index={i} example={ex} params={params} />)}

      {constraints.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 font-bold text-white">Constraints:</p>
          <ul className="list-disc space-y-1.5 pl-6 text-sm marker:text-slate-500">
            {constraints.map((c) => (
              <li key={c}>
                <code className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-slate-200">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {problem.hiddenTestCount > 0 && (
        <p className="mt-6 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
          <EyeOff size={16} className="shrink-0" /> Submitting also runs {problem.hiddenTestCount} hidden test cases, including edge cases.
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-5 text-sm">
        <div>
          <p className="text-slate-500">Accepted</p>
          <p className="font-semibold text-white">{problem.acceptedSubmissions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Submissions</p>
          <p className="font-semibold text-white">{problem.totalSubmissions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Acceptance Rate</p>
          <p className="font-semibold text-white">{problem.acceptanceRate == null ? '—' : `${problem.acceptanceRate}%`}</p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}
