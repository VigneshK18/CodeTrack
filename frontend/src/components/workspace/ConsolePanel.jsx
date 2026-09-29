import { useState } from 'react';
import { CheckCircle2, FlaskConical, Loader2, Plus, RotateCcw, SquareTerminal, X, XCircle } from 'lucide-react';
import { STATUS_STYLES, splitInput } from './format';

function CaseTabs({ count, active, onSelect, onRemove, onAdd, marks }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="group relative">
          <button
            onClick={() => onSelect(i)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active === i ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {marks && <span className={`h-1.5 w-1.5 rounded-full ${marks[i] === true ? 'bg-emerald-400' : marks[i] === false ? 'bg-rose-400' : 'bg-slate-500'}`} />}
            Case {i + 1}
          </button>
          {onRemove && count > 1 && (
            <button
              onClick={() => onRemove(i)}
              aria-label={`Remove case ${i + 1}`}
              className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-600 text-white group-hover:flex"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      {onAdd && count < 10 && (
        <button onClick={onAdd} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" title="Add a test case (copy of the current one)" aria-label="Add test case">
          <Plus size={15} />
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, tone = 'text-slate-200' }) {
  const rows = Math.min(8, Math.max(1, String(value ?? '').split('\n').length, Math.ceil(String(value ?? '').length / 70)));
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      {onChange ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          rows={rows}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-transparent bg-white/[0.05] px-3 py-2 font-mono text-[13px] text-slate-100 outline-none transition focus:border-brand-500/60"
        />
      ) : (
        <pre className={`max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white/[0.05] px-3 py-2 font-mono text-[13px] ${tone}`}>{value === '' || value == null ? ' ' : value}</pre>
      )}
    </div>
  );
}

export default function ConsolePanel({ tab, setTab, params, cases, setCases, onResetCases, running, result }) {
  const [activeCase, setActiveCase] = useState(0);
  const [activeResult, setActiveResult] = useState(0);
  const labels = params.length ? params : ['input'];
  const current = Math.min(activeCase, cases.length - 1);

  const updateValue = (pi, value) =>
    setCases((list) => list.map((c, ci) => (ci === current ? c.map((v, i) => (i === pi ? value : v)) : c)));

  const tabBtn = (id, label, Icon) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition ${tab === id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      <Icon size={15} className={tab === id ? 'text-emerald-400' : ''} /> {label}
    </button>
  );

  const resultCases = result?.cases || [];
  const shownResult = Math.min(activeResult, Math.max(0, resultCases.length - 1));
  const rc = resultCases[shownResult];

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex items-center border-b border-white/5 px-2">
        {tabBtn('testcase', 'Testcase', FlaskConical)}
        <span className="text-white/10">|</span>
        {tabBtn('result', 'Test Result', SquareTerminal)}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tab === 'testcase' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CaseTabs
                count={cases.length}
                active={current}
                onSelect={setActiveCase}
                onRemove={(i) => {
                  setCases((list) => list.filter((_, ci) => ci !== i));
                  setActiveCase(0);
                }}
                onAdd={() => {
                  setCases((list) => [...list, [...list[current]]]);
                  setActiveCase(cases.length);
                }}
              />
              <button onClick={onResetCases} className="btn-ghost py-1 text-xs" title="Restore the example test cases">
                <RotateCcw size={13} /> Reset
              </button>
            </div>
            {labels.map((label, pi) => (
              <Field key={label} label={`${label} =`} value={cases[current]?.[pi] ?? ''} onChange={(v) => updateValue(pi, v)} />
            ))}
          </div>
        )}

        {tab === 'result' && (
          <div>
            {running ? (
              <p className="flex items-center gap-2 py-6 text-slate-400"><Loader2 size={16} className="animate-spin" /> Compiling and running your code...</p>
            ) : !result ? (
              <p className="py-6 text-sm text-slate-500">
                You must run your code first. Press <span className="font-semibold text-slate-300">Run</span> (Ctrl + ') to test it on the cases in the Testcase tab.
              </p>
            ) : result.error ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{result.error}</pre>
            ) : (
              <div className="animate-fade-in space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={`flex items-center gap-2 text-xl font-bold ${STATUS_STYLES[result.status] || 'text-white'}`}>
                    {result.status === 'Accepted' ? <CheckCircle2 size={20} /> : <XCircle size={20} />} {result.status}
                  </h3>
                  {result.runtimeMs != null && result.status !== 'Compilation Error' && <span className="text-sm text-slate-400">Runtime: {result.runtimeMs} ms</span>}
                </div>

                {result.compileError && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 font-mono text-[13px] text-rose-200">{result.compileError}</pre>}

                {resultCases.length > 0 && (
                  <>
                    <CaseTabs count={resultCases.length} active={shownResult} onSelect={setActiveResult} marks={resultCases.map((c) => (c.passed === null ? null : c.passed && c.status === 'Accepted'))} />
                    {rc && (
                      <div className="space-y-3">
                        {rc.error && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-500/10 p-3 font-mono text-[13px] text-rose-200">{rc.error}</pre>}
                        {labels.map((label, pi) => (
                          <Field key={label} label={`${label} =`} value={splitInput(rc.input, params)[pi] ?? ''} />
                        ))}
                        {rc.stdout ? <Field label="Stdout" value={rc.stdout} tone="text-slate-400" /> : null}
                        {rc.status !== 'Runtime Error' && rc.status !== 'Time Limit Exceeded' && (
                          <Field label="Output" value={rc.output} tone={rc.passed === false ? 'text-rose-200' : 'text-slate-100'} />
                        )}
                        {rc.expectedError ? (
                          <Field label="Expected" value={rc.expectedError} tone="text-amber-200" />
                        ) : (
                          <Field label="Expected" value={rc.expected} tone="text-emerald-200" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
