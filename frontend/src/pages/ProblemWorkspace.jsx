import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Pane, SplitPane } from 'react-split-pane';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, CloudUpload, FileText, History, Lightbulb, List, Loader2, Play, RotateCcw, StickyNote } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { Alert, Spinner } from '../components/ui';
import DescriptionTab from '../components/workspace/DescriptionTab';
import EditorialTab from '../components/workspace/EditorialTab';
import SubmissionsTab from '../components/workspace/SubmissionsTab';
import NotesTab from '../components/workspace/NotesTab';
import ConsolePanel from '../components/workspace/ConsolePanel';
import { joinInput, paramList, splitInput } from '../components/workspace/format';

const FALLBACK_TEMPLATE = `class Solution {

}
`;

const draftKey = (id) => `codetrack_draft_v2_${id}`;

function readDraft(id) {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
}

export default function ProblemWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [problem, setProblem] = useState(null);
  const [error, setError] = useState('');
  const [leftTab, setLeftTab] = useState('description');

  const [code, setCode] = useState('');
  const [cases, setCases] = useState([['']]);
  const [consoleTab, setConsoleTab] = useState('testcase');
  const [running, setRunning] = useState(null); // 'run' | 'submit' | null
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [subsRefresh, setSubsRefresh] = useState(0);

  const [solved, setSolved] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const params = paramList(problem);
  const exampleCases = useCallback((p) => {
    const list = (p.examples || []).map((ex) => splitInput(ex.input, paramList(p)));
    return list.length ? list : [paramList(p).map(() => '')];
  }, []);

  // Load the problem, the saved draft and the user's status for it
  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    setError('');
    setRunResult(null);
    setSubmitResult(null);
    setSubmitError('');
    setLeftTab('description');
    setConsoleTab('testcase');

    api
      .get(`/problems/${id}`)
      .then((p) => {
        if (cancelled) return;
        setProblem(p);
        setCode(readDraft(p.id) || p.defaultCodeTemplate || FALLBACK_TEMPLATE);
        setCases(exampleCases(p));
      })
      .catch((err) => !cancelled && setError(err.message));

    Promise.all([api.get('/progress/statuses'), api.get('/bookmarks/ids')])
      .then(([st, bm]) => {
        if (cancelled) return;
        setSolved(st.solved.includes(Number(id)));
        setAttempted(st.attempted.includes(Number(id)));
        setBookmarked(bm.includes(Number(id)));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, exampleCases]);

  // Auto-save the draft
  useEffect(() => {
    if (!problem) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(problem.id), code);
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, problem]);

  const run = useCallback(async () => {
    if (!problem || running) return;
    setRunning('run');
    setConsoleTab('result');
    try {
      const res = await api.post('/execution/run', { problemId: problem.id, code, inputs: cases.map(joinInput) });
      setRunResult(res);
    } catch (err) {
      setRunResult({ error: err.message });
    } finally {
      setRunning(null);
    }
  }, [problem, running, code, cases]);

  const submit = useCallback(async () => {
    if (!problem || running) return;
    setRunning('submit');
    setLeftTab('submissions');
    setSubmitError('');
    try {
      const res = await api.post('/submissions', { problemId: problem.id, code });
      setSubmitResult(res);
      if (res.status === 'Accepted') setSolved(true);
      else setAttempted(true);
      setSubsRefresh((n) => n + 1);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setRunning(null);
    }
  }, [problem, running, code]);

  // Keyboard shortcuts: Ctrl/Cmd + ' runs, Ctrl/Cmd + Enter submits
  const shortcuts = useRef({ run, submit });
  shortcuts.current = { run, submit };
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "'") {
        e.preventDefault();
        shortcuts.current.run();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        shortcuts.current.submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function toggleBookmark() {
    try {
      if (bookmarked) await api.delete(`/bookmarks/${problem.id}`);
      else await api.post(`/bookmarks/${problem.id}`, { tag: 'Revise Later' });
      setBookmarked(!bookmarked);
    } catch {
      /* ignore */
    }
  }

  function resetCode() {
    if (confirm('Reset your code to the starter template? Your current code will be lost.')) {
      setCode(problem.defaultCodeTemplate || FALLBACK_TEMPLATE);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Alert type="error">{error}</Alert>
        <Link to="/problems" className="btn-outline mt-6"><ArrowLeft size={16} /> Back to problems</Link>
      </div>
    );
  }
  if (!problem) return <Spinner label="Loading problem..." className="min-h-[60vh]" />;

  // ------------------------------------------------------------------ panels

  const leftTabs = [
    ['description', 'Description', FileText],
    ['editorial', 'Editorial', Lightbulb],
    ['submissions', 'Submissions', History],
    ['notes', 'Notes', StickyNote]
  ];

  const leftPanel = (
    <div className="flex h-full flex-col bg-ink-950">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 px-2">
        {leftTabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setLeftTab(key)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              leftTab === key ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {leftTab === 'description' && (
          <DescriptionTab problem={problem} solved={solved} attempted={attempted} bookmarked={bookmarked} onToggleBookmark={toggleBookmark} canBookmark={user && !isAdmin} />
        )}
        {leftTab === 'editorial' && <EditorialTab key={problem.id} problem={problem} solved={solved || isAdmin} />}
        {leftTab === 'submissions' && (
          <>
            {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}
            <SubmissionsTab problem={problem} latest={submitResult} refreshKey={subsRefresh} judging={running === 'submit'} onLoadCode={(c) => setCode(c)} />
          </>
        )}
        {leftTab === 'notes' && <NotesTab problemId={problem.id} />}
      </div>
    </div>
  );

  const editorPanel = (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-black/40 bg-ink-900 px-3 py-1.5">
        <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-slate-300">Java</span>
        <button onClick={resetCode} className="btn-ghost py-1 text-xs" title="Reset to the starter code">
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language="java"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          loading={<div className="p-4 text-sm text-slate-500">Loading editor...</div>}
          options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 12 }, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4 }}
        />
      </div>
    </div>
  );

  const consolePanel = (
    <ConsolePanel
      tab={consoleTab}
      setTab={setConsoleTab}
      params={params}
      cases={cases}
      setCases={setCases}
      onResetCases={() => setCases(exampleCases(problem))}
      running={running === 'run'}
      result={runResult}
    />
  );

  const toolbar = (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-ink-950 px-3">
      <div className="flex min-w-0 items-center gap-1">
        <Link to="/problems" className="btn-ghost py-1.5 text-sm"><List size={16} /> <span className="hidden sm:inline">Problem List</span></Link>
        <button onClick={() => problem.prevId && navigate(`/problems/${problem.prevId}`)} disabled={!problem.prevId} className="btn-ghost p-1.5" title="Previous problem" aria-label="Previous problem">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => problem.nextId && navigate(`/problems/${problem.nextId}`)} disabled={!problem.nextId} className="btn-ghost p-1.5" title="Next problem" aria-label="Next problem">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={run} disabled={Boolean(running)} className="btn-outline px-4 py-1.5" title="Run on the test cases (Ctrl + ')">
          {running === 'run' ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} className="fill-current" />} Run
        </button>
        <button
          onClick={submit}
          disabled={Boolean(running)}
          className="btn bg-emerald-600 px-4 py-1.5 text-white hover:bg-emerald-500"
          title="Submit against all test cases (Ctrl + Enter)"
        >
          {running === 'submit' ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />} Submit
        </button>
      </div>
      <div className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 md:flex">
        <BookOpen size={15} /> <span className="truncate">{problem.id}. {problem.title}</span>
      </div>
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="flex flex-col">
        {toolbar}
        <div className="space-y-4 p-3">
          <div className="h-[70vh] overflow-hidden rounded-2xl border border-white/10">{leftPanel}</div>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10">{editorPanel}</div>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10">{consolePanel}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {toolbar}
      <div className="min-h-0 flex-1">
        <SplitPane direction="horizontal">
          <Pane defaultSize="44%" minSize="340px">{leftPanel}</Pane>
          <Pane minSize="420px">
            <SplitPane direction="vertical">
              <Pane defaultSize="62%" minSize="120px">{editorPanel}</Pane>
              <Pane minSize="120px">{consolePanel}</Pane>
            </SplitPane>
          </Pane>
        </SplitPane>
      </div>
    </div>
  );
}
