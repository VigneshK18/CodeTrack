import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, CircleDashed, Layers, Loader2, Lock, Search, Shuffle, Signal } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

const PAGE_SIZE = 25;
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const LEVEL_COLORS = { Easy: 'bg-emerald-400', Medium: 'bg-amber-400', Hard: 'bg-rose-400' };
const LEVEL_TEXT = { Easy: 'text-emerald-300', Medium: 'text-amber-300', Hard: 'text-rose-300' };

function FilterField({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      {children}
    </div>
  );
}

/** "12/49 Solved" with an Easy / Medium / Hard breakdown, like LeetCode's sidebar. */
function ProgressSummary({ stats }) {
  const pct = stats.totalProblems ? (stats.solvedProblems / stats.totalProblems) * 100 : 0;
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div className="card mb-6 flex flex-col gap-6 p-5 sm:flex-row sm:items-center">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(pct / 100) * circ} ${circ}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-white">{stats.solvedProblems}</span>
          <span className="text-[11px] text-slate-400">/ {stats.totalProblems} solved</span>
        </div>
      </div>
      <div className="grid flex-1 gap-3 sm:grid-cols-3">
        {['Easy', 'Medium', 'Hard'].map((level) => {
          const solved = stats[`${level.toLowerCase()}Solved`] || 0;
          const total = stats.difficultyTotals?.[level] || 0;
          return (
            <div key={level} className="rounded-xl bg-white/[0.03] p-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className={`font-semibold ${LEVEL_TEXT[level]}`}>{level}</span>
                <span className="text-slate-400"><span className="font-bold text-white">{solved}</span> / {total}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${LEVEL_COLORS[level]}`} style={{ width: `${total ? (solved / total) * 100 : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Problems() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 1, totalElements: 0, last: true });
  const [status, setStatus] = useState({ solved: [], attempted: [] });
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState(['All']);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/problems/categories').then((cats) => setCategories(['All', ...cats])).catch(() => {});
    if (user) {
      Promise.all([api.get('/progress/statuses'), api.get('/bookmarks/ids')])
        .then(([st, bookmarks]) => {
          setStatus(st);
          setBookmarkIds(bookmarks || []);
        })
        .catch(() => {});
      if (!isAdmin) api.get('/progress/stats').then(setStats).catch(() => {});
    }
  }, [user, isAdmin]);

  // Wait until typing pauses before searching.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page, size: PAGE_SIZE });
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (category !== 'All') params.set('category', category);
    if (difficulty !== 'All') params.set('difficulty', difficulty);

    api
      .get(`/problems?${params}`)
      .then((res) => {
        if (cancelled) return;
        setProblems(res.content || []);
        setPageData({ totalPages: res.totalPages, totalElements: res.totalElements, last: res.last });
        setError('');
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, difficulty, page]);

  async function pickOne() {
    setPicking(true);
    try {
      const { id } = await api.get('/problems/random');
      navigate(`/problems/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPicking(false);
    }
  }

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_55%)]">
      <PageContainer>
        <PageHeader
          eyebrow="Curated library"
          title="Problems"
          subtitle="Java DSA problems with hidden test cases. Run your code on the examples, then submit to be judged."
          actions={
            <button onClick={pickOne} disabled={picking} className="btn-outline" title="Open a random problem">
              {picking ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />} Pick One
            </button>
          }
        />

        {stats && <ProgressSummary stats={stats} />}

        {!user && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <Lock size={16} className="shrink-0" /> Log in to open a problem, run your code and track your progress.
            </span>
            <span className="flex shrink-0 gap-2">
              <Link to="/login" className="btn-primary px-4 py-1.5 text-xs">Log in</Link>
              <Link to="/register" className="btn-outline px-4 py-1.5 text-xs">Create account</Link>
            </span>
          </div>
        )}

        <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr]">
          <FilterField icon={Search}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by number, title or tag..." aria-label="Search problems" className="input pl-11" />
          </FilterField>
          <FilterField icon={Layers}>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} aria-label="Filter by topic" className="input appearance-none pl-11">
              {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All topics' : c}</option>)}
            </select>
          </FilterField>
          <FilterField icon={Signal}>
            <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(0); }} aria-label="Filter by difficulty" className="input appearance-none pl-11">
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d === 'All' ? 'All difficulties' : d}</option>)}
            </select>
          </FilterField>
        </div>

        <p className="mb-3 text-sm text-slate-400">{pageData.totalElements} problems</p>
        <Alert type="error" className="mb-6">{error}</Alert>

        <div className="card overflow-hidden">
          {loading ? (
            <Spinner label="Fetching problems..." />
          ) : problems.length === 0 ? (
            <EmptyState icon={<Search size={24} />} title="No problems match these filters">
              Try a different search term or reset the topic and difficulty filters.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-14 px-3 py-4 sm:w-20 sm:px-6"><span className="sr-only sm:not-sr-only">Status</span></th>
                    <th className="px-3 py-4 sm:px-6">Title</th>
                    <th className="hidden px-3 py-4 sm:table-cell sm:px-6">Acceptance</th>
                    <th className="px-3 py-4 sm:px-6">Difficulty</th>
                    <th className="hidden px-3 py-4 md:table-cell">Topic</th>
                    <th className="hidden px-3 py-4 text-right lg:table-cell sm:px-6"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => {
                    const solved = status.solved.includes(problem.id);
                    const attempted = !solved && status.attempted.includes(problem.id);
                    const bookmarked = bookmarkIds.includes(problem.id);
                    return (
                      <tr key={problem.id} className="border-b border-white/[0.04] transition last:border-0 even:bg-white/[0.015] hover:bg-white/[0.04]">
                        <td className="px-3 py-3.5 sm:px-6">
                          <div className="flex items-center gap-2">
                            {solved ? (
                              <CheckCircle2 size={18} className="text-emerald-400" aria-label="Solved" />
                            ) : attempted ? (
                              <CircleDashed size={18} className="text-amber-400" aria-label="Attempted" />
                            ) : (
                              <span className="h-[18px] w-[18px]" />
                            )}
                            {bookmarked && <Bookmark size={14} className="fill-amber-400 text-amber-400" aria-label="Bookmarked" />}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 sm:px-6">
                          <Link to={`/problems/${problem.id}`} className="font-semibold text-white hover:text-brand-300">
                            {problem.id}. {problem.title}
                          </Link>
                        </td>
                        <td className="hidden px-3 py-3.5 text-slate-300 sm:table-cell sm:px-6">
                          {problem.acceptanceRate == null ? <span className="text-slate-600">—</span> : `${problem.acceptanceRate}%`}
                        </td>
                        <td className="px-3 py-3.5 sm:px-6"><DifficultyBadge level={problem.difficulty} /></td>
                        <td className="hidden px-3 py-3.5 md:table-cell">
                          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300">{problem.category}</span>
                        </td>
                        <td className="hidden px-3 py-3.5 text-right lg:table-cell sm:px-6">
                          <Link to={`/problems/${problem.id}`} className="btn-primary px-4 py-1.5 text-xs" title={user ? undefined : 'Log in to solve this problem'}>
                            {!user && <Lock size={13} />}
                            {isAdmin ? 'Review' : solved ? 'Solve again' : 'Solve'} <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pageData.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
            <button className="btn-outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-slate-400">Page <span className="font-bold text-white">{page + 1}</span> of {pageData.totalPages}</span>
            <button className="btn-outline" disabled={pageData.last} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </PageContainer>
    </div>
  );
}
