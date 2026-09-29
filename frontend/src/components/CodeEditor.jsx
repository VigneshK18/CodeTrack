import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Pane, SplitPane } from 'react-split-pane';
import { CheckCircle2, Clock, Loader2, Play, RotateCcw, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STARTER_CODE = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here

    }
}
`;

const draftKey = (id) => `codetrack_draft_${id}`;

function readDraft(id) {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
}

function parseTests(json) {
  try {
    const tests = JSON.parse(json || '[]');
    return Array.isArray(tests) ? tests : [];
  } catch {
    return [];
  }
}

function Verdict({ result }) {
  const hasTests = result.testResults?.length > 0;
  const passed = result.testResults?.filter((t) => t.passed).length ?? 0;

  let title = 'Finished';
  let tone = 'text-emerald-400';
  let Icon = CheckCircle2;

  if (result.error?.startsWith('Compilation Error')) {
    title = 'Compilation Error';
    tone = 'text-rose-400';
    Icon = XCircle;
  } else if (!result.success) {
    title = result.error?.split('\n')[0] || 'Error';
    tone = 'text-rose-400';
    Icon = XCircle;
  } else if (hasTests) {
    title = result.allPassed ? 'Accepted' : 'Wrong Answer';
    tone = result.allPassed ? 'text-emerald-400' : 'text-rose-400';
    Icon = result.allPassed ? CheckCircle2 : XCircle;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <h3 className={`flex items-center gap-2 text-lg font-bold ${tone}`}>
        <Icon size={20} /> {title}
      </h3>
      {hasTests && (
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300">
          {passed}/{result.testResults.length} test cases passed
        </span>
      )}
      {result.runtimeMs > 0 && (
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300">
          <Clock size={12} /> {result.runtimeMs} ms
        </span>
      )}
    </div>
  );
}

function IOBlock({ label, value, tone = 'text-slate-200' }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <pre className={`max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/50 px-3 py-2 font-mono text-xs ${tone}`}>{value || ' '}</pre>
    </div>
  );
}

export default function CodeEditor({ problem, onSolved, stacked = false }) {
  const { user } = useAuth();
  const tests = useMemo(() => parseTests(problem.testCasesJson), [problem.testCasesJson]);
  const template = problem.defaultCodeTemplate || STARTER_CODE;

  const [code, setCode] = useState(() => readDraft(problem.id) || template);
  const [stdin, setStdin] = useState(problem.sampleInput || '');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tests');

  // Save the draft so a refresh doesn't lose work.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(problem.id), code);
      } catch {
        /* storage unavailable */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [code, problem.id]);

  const run = useCallback(async () => {
    setRunning(true);
    setError('');
    setTab('result');
    try {
      const res = await api.post('/execution/run', { code, problemId: problem.id, input: stdin });
      setResult(res);
      if (res.markedSolved) onSolved?.();
    } catch (err) {
      setError(err.message || 'Failed to run code');
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, [code, problem.id, stdin, onSolved]);

  // Ctrl/Cmd + Enter runs the code.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !running) {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, running]);

  function reset() {
    if (confirm('Replace your code with the starter template?')) setCode(template);
  }

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        tab === id ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const editor = (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between gap-2 border-b border-black/40 bg-ink-900 px-3 py-2">
        <span className="font-mono text-xs text-slate-400">Java 17</span>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="btn-ghost py-1.5 text-xs" title="Reset to starter code">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={run} disabled={running} className="btn-primary px-4 py-1.5 text-xs" title="Run (Ctrl + Enter)">
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
            {running ? 'Running...' : 'Run code'}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="java"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          loading={<div className="p-4 text-sm text-slate-500">Loading editor...</div>}
          options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 12 }, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4 }}
        />
      </div>
    </div>
  );

  const consolePane = (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex border-b border-white/5">
        {tabBtn('tests', tests.length ? `Test cases (${tests.length})` : 'Custom input')}
        {tabBtn('result', 'Result')}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
        {tab === 'tests' &&
          (tests.length ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Your code runs against every case below. Passing all of them marks the problem as solved.</p>
              {tests.map((t, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-white/5 p-3 sm:grid-cols-2">
                  <IOBlock label={`Case ${i + 1} input`} value={t.input} />
                  <IOBlock label="Expected output" value={t.output} />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label htmlFor="stdin" className="label">Input passed to your program (stdin)</label>
              <textarea
                id="stdin"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={4}
                className="input resize-none font-mono text-xs"
                placeholder="e.g. 5"
              />
              <p className="mt-2 text-xs text-slate-500">This problem has no automatic test cases yet, so check the output yourself.</p>
            </div>
          ))}

        {tab === 'result' && (
          <div>
            {running ? (
              <p className="flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Compiling and running...
              </p>
            ) : error ? (
              <p className="rounded-lg bg-rose-500/10 p-3 text-rose-300">{error}</p>
            ) : result ? (
              <div className="animate-fade-in">
                <Verdict result={result} />

                {result.markedSolved && (
                  <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300">Problem marked as solved. Nice work!</p>
                )}
                {!user && result.allPassed && tests.length > 0 && (
                  <p className="mb-4 rounded-lg bg-brand-500/10 px-3 py-2 text-brand-300">
                    <Link to="/login" className="font-semibold underline">Log in</Link> to save your progress.
                  </p>
                )}

                {result.error && result.error !== 'Time Limit Exceeded' && result.error !== 'Runtime Error' && (
                  <pre className="mb-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/50 p-3 font-mono text-xs text-rose-300">{result.error}</pre>
                )}

                {result.testResults?.length > 0 ? (
                  <div className="space-y-3">
                    {result.testResults.map((t, i) => (
                      <div key={i} className="rounded-xl border border-white/5 p-3">
                        <div className="mb-2 flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">Case {i + 1}</span>
                          <span className={t.passed ? 'text-emerald-400' : 'text-rose-400'}>{t.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <IOBlock label="Input" value={t.input} />
                          <IOBlock label="Expected" value={t.expectedOutput} />
                          <IOBlock label="Your output" value={t.actualOutput} tone={t.passed ? 'text-emerald-300' : 'text-rose-300'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  result.success && <IOBlock label="Output" value={result.output} tone="text-emerald-300" />
                )}
              </div>
            ) : (
              <p className="text-slate-500">
                Press <span className="font-semibold text-slate-300">Run code</span> (or Ctrl + Enter) to compile and test your solution.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (stacked) {
    return (
      <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-white/10">
        <div className="h-[420px]">{editor}</div>
        <div className="h-[360px] border-t border-white/10">{consolePane}</div>
      </div>
    );
  }

  return (
    <SplitPane direction="vertical">
      <Pane defaultSize="62%" minSize="120px">{editor}</Pane>
      <Pane minSize="100px">{consolePane}</Pane>
    </SplitPane>
  );
}
