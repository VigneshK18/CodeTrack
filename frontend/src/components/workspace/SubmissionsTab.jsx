import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Code2, EyeOff, Gauge, Loader2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../ui';
import { STATUS_STYLES, paramList, splitInput, timeAgo } from './format';

function IOField({ label, value, tone = 'text-slate-200' }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <pre className={`max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[13px] ${tone}`}>{value === '' || value == null ? ' ' : value}</pre>
    </div>
  );
}

export function InputFields({ input, params }) {
  const values = splitInput(input, params);
  if (!params.length) return <IOField label="Input" value={input} />;
  return (
    <div className="space-y-2">
      {params.map((p, i) => <IOField key={p} label={`${p} =`} value={values[i]} />)}
    </div>
  );
}

/** Result card shown right after pressing Submit. */
export function SubmissionResult({ result, problem }) {
  const params = paramList(problem);
  const accepted = result.status === 'Accepted';
  const fc = result.failedCase;

  return (
    <div className="animate-fade-in rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`flex items-center gap-2 text-2xl font-bold ${STATUS_STYLES[result.status] || 'text-white'}`}>
          {accepted ? <CheckCircle2 size={24} /> : <XCircle size={24} />} {result.status}
        </h3>
        {result.status !== 'Compilation Error' && (
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-white">{result.passedCount}</span> / {result.totalCount} testcases passed
          </span>
        )}
      </div>

      {accepted && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={13} /> Runtime</p>
            <p className="mt-1 text-2xl font-bold text-white">{result.runtimeMs} <span className="text-sm font-normal text-slate-400">ms</span></p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Gauge size={13} /> Beats</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{result.beats}%</p>
            <p className="text-xs text-slate-500">of accepted Java submissions</p>
          </div>
        </div>
      )}

      {result.compileError && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 font-mono text-[13px] text-rose-200">{result.compileError}</pre>}

      {fc && (
        <div className="mt-4 space-y-3">
          {fc.error && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 font-mono text-[13px] text-rose-200">{fc.error}</pre>}
          {fc.hidden ? (
            <p className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-slate-300">
              <EyeOff size={15} className="shrink-0 text-slate-500" /> Failed on hidden test case {fc.index + 1}. Hidden inputs are not shown, so think about edge cases.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-400">Failed on test case {fc.index + 1}:</p>
              <InputFields input={fc.input} params={params} />
              {fc.stdout ? <IOField label="Stdout" value={fc.stdout} tone="text-slate-400" /> : null}
              {fc.output != null && <IOField label="Output" value={fc.output} tone="text-rose-200" />}
              <IOField label="Expected" value={fc.expected} tone="text-emerald-200" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionDetail({ id, onBack, onLoadCode }) {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/submissions/${id}`).then(setSub).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-rose-300">{error}</p>;
  if (!sub) return <Spinner label="Loading submission..." />;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="btn-ghost -ml-3 mb-3 text-xs"><ArrowLeft size={14} /> All submissions</button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`text-xl font-bold ${STATUS_STYLES[sub.status] || 'text-white'}`}>{sub.status}</h3>
          <p className="text-sm text-slate-400">
            {sub.passedCount} / {sub.totalCount} testcases passed · {sub.runtimeMs != null ? `${sub.runtimeMs} ms · ` : ''}{timeAgo(sub.createdAt)}
          </p>
        </div>
        <button onClick={() => onLoadCode(sub.code)} className="btn-outline py-2 text-xs"><Code2 size={14} /> Load into editor</button>
      </div>
      <pre className="code-block mt-4 text-slate-200">{sub.code}</pre>
    </div>
  );
}

export default function SubmissionsTab({ problem, latest, refreshKey, onLoadCode, judging }) {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
    api.get(`/submissions?problemId=${problem.id}`).then(setItems).catch(() => setItems([]));
  }, [problem.id, refreshKey]);

  if (selected) return <SubmissionDetail id={selected} onBack={() => setSelected(null)} onLoadCode={onLoadCode} />;

  return (
    <div className="space-y-5">
      {judging && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-5 text-brand-200">
          <Loader2 size={20} className="animate-spin" /> Judging your submission against all test cases...
        </div>
      )}
      {!judging && latest && <SubmissionResult result={latest} problem={problem} />}

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Your submissions</h3>
        {items == null ? (
          <Spinner label="Loading..." className="py-8" />
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No submissions yet. Press Submit to judge your code against every test case.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Runtime</th>
                  <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Language</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} onClick={() => setSelected(s.id)} className="cursor-pointer border-t border-white/[0.04] hover:bg-white/[0.04]">
                    <td className={`px-4 py-2.5 font-semibold ${STATUS_STYLES[s.status] || ''}`}>{s.status}</td>
                    <td className="px-4 py-2.5 text-slate-300">{s.runtimeMs != null ? `${s.runtimeMs} ms` : 'N/A'}</td>
                    <td className="hidden px-4 py-2.5 text-slate-400 sm:table-cell">Java</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{timeAgo(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
