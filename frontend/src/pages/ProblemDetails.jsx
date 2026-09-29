import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pane, SplitPane } from 'react-split-pane';
import { ArrowLeft, Bookmark, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';
import useMediaQuery from '../hooks/useMediaQuery';
import { Alert, DifficultyBadge, Spinner } from '../components/ui';

function InfoBlock({ title, text, code = false }) {
  if (!text) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
      {code ? <pre className="code-block">{text}</pre> : <p className="whitespace-pre-line leading-relaxed text-slate-300">{text}</p>}
    </div>
  );
}

export default function ProblemDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [problem, setProblem] = useState(null);
  const [tab, setTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [solved, setSolved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState('');
  const [noteStatus, setNoteStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setTab('description');

    api
      .get(`/problems/${id}`)
      .then((data) => !cancelled && setProblem(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    if (user) {
      Promise.all([
        api.get('/progress/solved-ids'),
        api.get('/bookmarks/ids'),
        api.get(`/notes/${id}`).catch(() => ({ note: '' }))
      ])
        .then(([solvedIds, bookmarkIds, noteData]) => {
          if (cancelled) return;
          setSolved(solvedIds.includes(Number(id)));
          setBookmarked(bookmarkIds.includes(Number(id)));
          setNote(noteData?.note || '');
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleSolved = useCallback(() => setSolved(true), []);

  async function toggleBookmark() {
    try {
      if (bookmarked) await api.delete(`/bookmarks/${id}`);
      else await api.post(`/bookmarks/${id}`, { tag: 'Revise Later' });
      setBookmarked(!bookmarked);
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveNote() {
    try {
      await api.post(`/notes/${id}`, { note });
      setNoteStatus({ type: 'success', text: 'Note saved' });
    } catch (err) {
      setNoteStatus({ type: 'error', text: err.message });
    }
    setTimeout(() => setNoteStatus({ type: '', text: '' }), 2500);
  }

  async function deleteNote() {
    try {
      await api.delete(`/notes/${id}`);
      setNote('');
      setNoteStatus({ type: 'success', text: 'Note deleted' });
    } catch (err) {
      setNoteStatus({ type: 'error', text: err.message });
    }
    setTimeout(() => setNoteStatus({ type: '', text: '' }), 2500);
  }

  if (loading) return <Spinner label="Loading problem..." className="min-h-[60vh]" />;
  if (!problem) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Alert type="error">{error || 'Problem not found'}</Alert>
        <Link to="/problems" className="btn-outline mt-6">
          <ArrowLeft size={16} /> Back to problems
        </Link>
      </div>
    );
  }

  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        tab === key ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const infoPane = (
    <div className="flex h-full flex-col bg-ink-950">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
        {tabBtn('description', 'Description')}
        {tabBtn('solution', 'Solution')}
        {user && tabBtn('notes', 'My notes')}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {tab === 'description' && (
          <article className="animate-fade-in">
            <Link to="/problems" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white">
              <ArrowLeft size={14} /> All problems
            </Link>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">{problem.title}</h1>
              {user && !isAdmin && (
                <button
                  onClick={toggleBookmark}
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
              <span className="rounded-full bg-white/5 px-3 py-0.5 text-slate-300">{problem.category}</span>
              {solved && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-0.5 font-semibold text-emerald-300">
                  <CheckCircle2 size={14} /> Solved
                </span>
              )}
            </div>

            <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-300">{problem.description}</p>
            <InfoBlock title="Input format" text={problem.inputFormat} />
            <InfoBlock title="Output format" text={problem.outputFormat} />
            <InfoBlock title="Constraints" text={problem.constraintsText} code />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <InfoBlock title="Sample input" text={problem.sampleInput} code />
              <InfoBlock title="Sample output" text={problem.sampleOutput} code />
            </div>
            {problem.tags && (
              <div className="mt-6 flex flex-wrap gap-2">
                {problem.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-400">#{t}</span>
                ))}
              </div>
            )}
          </article>
        )}

        {tab === 'solution' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-white">Reference solution</h2>
            <div className="mt-3 flex gap-3 text-sm">
              <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-slate-300">Time: {problem.timeComplexity || 'n/a'}</span>
              <span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-slate-300">Space: {problem.spaceComplexity || 'n/a'}</span>
            </div>
            <InfoBlock title="Approach" text={problem.explanation} />
            <div className="mt-6">
              <pre className="code-block">{problem.javaSolution || 'No solution added yet.'}</pre>
            </div>
          </div>
        )}

        {tab === 'notes' && user && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-white">My notes</h2>
            <p className="mt-1 text-sm text-slate-400">Only you can see these. Write down the key idea so revision is quick.</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Key insight, edge cases, pseudocode..."
              className="input mt-4 h-64 resize-none"
            />
            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveNote} className="btn-primary">
                <Save size={16} /> Save note
              </button>
              {note && (
                <button onClick={deleteNote} className="btn-ghost text-rose-300">
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
            {noteStatus.text && <Alert type={noteStatus.type} className="mt-4">{noteStatus.text}</Alert>}
          </div>
        )}
      </div>
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="space-y-4 px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-white/10">{infoPane}</div>
        <CodeEditor key={problem.id} problem={problem} onSolved={handleSolved} stacked />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-4rem)]">
      <SplitPane direction="horizontal">
        <Pane defaultSize="42%" minSize="320px">{infoPane}</Pane>
        <Pane minSize="420px">
          <CodeEditor key={problem.id} problem={problem} onSolved={handleSolved} />
        </Pane>
      </SplitPane>
    </div>
  );
}
