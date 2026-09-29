import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Code, Edit3, EyeOff, FileText, Search, StickyNote, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

export default function Notes() {
  const { isAdmin } = useAuth();
  const [personalNotes, setPersonalNotes] = useState([]);
  const [studyNotes, setStudyNotes] = useState([]);
  const [tab, setTab] = useState(isAdmin ? 'study' : 'personal');
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/notes'), api.get('/problems?size=100')])
      .then(([personal, library]) => {
        setPersonalNotes(personal);
        setStudyNotes((library.content || []).filter((p) => p.explanation || p.javaSolution));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudy = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? studyNotes.filter((n) => `${n.title} ${n.category}`.toLowerCase().includes(q)) : studyNotes;
  }, [filter, studyNotes]);

  const tabBtn = (key, label, Icon, count) => (
    <button
      onClick={() => setTab(key)}
      className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition ${
        tab === key ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={16} /> {label}
      <span className="rounded-full bg-white/5 px-2 text-xs text-slate-400">{count}</span>
    </button>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow={isAdmin ? 'Content management' : 'Knowledge base'}
        title={isAdmin ? 'Study materials' : 'Study center'}
        subtitle={
          isAdmin
            ? 'Review the explanations and reference solutions students see.'
            : 'Your personal notes, plus the official explanation for every problem.'
        }
      />

      <div className="mb-8 flex gap-6 border-b border-white/5">
        {!isAdmin && tabBtn('personal', 'My notes', UserIcon, personalNotes.length)}
        {tabBtn('study', 'Study notes', BookOpen, studyNotes.length)}
      </div>

      <Alert type="error" className="mb-6">{error}</Alert>

      {loading ? (
        <Spinner label="Loading notes..." />
      ) : tab === 'personal' ? (
        personalNotes.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {personalNotes.map((n) => (
              <article key={n.id} className="card flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white">{n.problemTitle}</h3>
                  <DifficultyBadge level={n.difficulty} />
                </div>
                <p className="mt-3 line-clamp-5 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">{n.note || <em className="text-slate-500">Empty note</em>}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-sm">
                  <span className="text-slate-500">{n.updatedAt?.slice(0, 10)}</span>
                  <Link to={`/problems/${n.problemId}`} className="flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300">
                    Open <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState icon={<StickyNote size={24} />} title="No notes yet">
              Open any problem and use the <b>My notes</b> tab to write down the key idea.
            </EmptyState>
          </div>
        )
      ) : (
        <>
          <div className="relative mb-6 max-w-md">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by title or topic..." className="input pl-11" aria-label="Filter study notes" />
          </div>
          <div className="space-y-4">
            {filteredStudy.map((n) => (
              <article key={n.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow tracking-widest">{n.category}</span>
                    <h2 className="mt-1 text-xl font-bold text-white">{n.title}</h2>
                  </div>
                  {isAdmin ? (
                    <Link to={`/admin/problems/${n.id}/edit`} className="btn-outline py-2 text-xs"><Edit3 size={14} /> Edit</Link>
                  ) : (
                    <Link to={`/problems/${n.id}`} className="btn-outline py-2 text-xs">Solve problem</Link>
                  )}
                </div>

                {n.explanation && (
                  <div className="mt-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400"><FileText size={15} /> Approach</h3>
                    <p className="rounded-xl bg-white/[0.03] p-4 leading-relaxed text-slate-300">{n.explanation}</p>
                  </div>
                )}

                {n.javaSolution && (
                  <div className="mt-4">
                    <button onClick={() => setOpen((o) => ({ ...o, [n.id]: !o[n.id] }))} className="btn-ghost -ml-3 text-xs" aria-expanded={!!open[n.id]}>
                      {open[n.id] ? <><EyeOff size={15} /> Hide code</> : <><Code size={15} /> Show reference code</>}
                    </button>
                    {open[n.id] && <pre className="code-block mt-3 animate-fade-in">{n.javaSolution}</pre>}
                  </div>
                )}
              </article>
            ))}
            {!filteredStudy.length && <div className="card"><EmptyState title="No study notes match that filter" /></div>}
          </div>
        </>
      )}
    </PageContainer>
  );
}
