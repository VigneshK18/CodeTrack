import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Layers, Search, Signal } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

const PAGE_SIZE = 15;
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

function FilterField({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      {children}
    </div>
  );
}

export default function Problems() {
  const { user, isAdmin } = useAuth();
  const [problems, setProblems] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 1, totalElements: 0, last: true });
  const [solvedIds, setSolvedIds] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [categories, setCategories] = useState(['All']);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/problems/categories').then((cats) => setCategories(['All', ...cats])).catch(() => {});
    if (user) {
      Promise.all([api.get('/progress/solved-ids'), api.get('/bookmarks/ids')])
        .then(([solved, bookmarks]) => {
          setSolvedIds(solved || []);
          setBookmarkIds(bookmarks || []);
        })
        .catch(() => {});
    }
  }, [user]);

  // Wait until typing pauses before searching.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);
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

  const solvedCount = problems.filter((p) => solvedIds.includes(p.id)).length;

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_55%)]">
      <PageContainer>
        <PageHeader
          eyebrow="Curated library"
          title="Problem Library"
          subtitle="Hand-picked Java DSA problems. Filter by topic or difficulty and start solving."
        />

        <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr]">
          <FilterField icon={Search}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or tag..."
              aria-label="Search problems"
              className="input pl-11"
            />
          </FilterField>
          <FilterField icon={Layers}>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by topic"
              className="input appearance-none pl-11"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All topics' : c}</option>
              ))}
            </select>
          </FilterField>
          <FilterField icon={Signal}>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by difficulty"
              className="input appearance-none pl-11"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All difficulties' : d}</option>
              ))}
            </select>
          </FilterField>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
          <span>{pageData.totalElements} problems</span>
          {user && !isAdmin && <span>{solvedCount} solved on this page</span>}
        </div>

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
                    <th className="hidden px-3 py-4 sm:px-6 md:table-cell">Topic</th>
                    <th className="px-3 py-4 sm:px-6">Difficulty</th>
                    <th className="hidden px-3 py-4 text-right sm:table-cell sm:px-6"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => {
                    const solved = solvedIds.includes(problem.id);
                    const bookmarked = bookmarkIds.includes(problem.id);
                    return (
                      <tr key={problem.id} className="border-b border-white/[0.04] transition last:border-0 even:bg-white/[0.015] hover:bg-white/[0.04]">
                        <td className="px-3 py-4 sm:px-6">
                          <div className="flex gap-2">
                            {solved ? (
                              <span className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400" title="Solved">
                                <CheckCircle2 size={16} />
                              </span>
                            ) : (
                              <span className="rounded-lg border border-dashed border-white/10 p-1.5 text-white/15" title="Not solved yet">
                                <CheckCircle2 size={16} />
                              </span>
                            )}
                            {bookmarked && (
                              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400" title="Bookmarked">
                                <Bookmark size={16} className="fill-amber-400" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 sm:px-6">
                          <Link to={`/problems/${problem.id}`} className="text-base font-bold text-white hover:text-brand-300">
                            {problem.title}
                          </Link>
                          <p className="mt-0.5 font-mono text-xs text-slate-500">{problem.timeComplexity}</p>
                        </td>
                        <td className="hidden px-3 py-4 sm:px-6 md:table-cell">
                          <span className="rounded-lg bg-white/5 px-3 py-1 text-slate-300">{problem.category}</span>
                        </td>
                        <td className="px-3 py-4 sm:px-6">
                          <DifficultyBadge level={problem.difficulty} />
                        </td>
                        <td className="hidden px-3 py-4 text-right sm:table-cell sm:px-6">
                          <Link to={`/problems/${problem.id}`} className="btn-primary px-4 py-2 text-xs">
                            {isAdmin ? 'Review' : 'Solve'} <ChevronRight size={14} />
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
            <span className="text-sm text-slate-400">
              Page <span className="font-bold text-white">{page + 1}</span> of {pageData.totalPages}
            </span>
            <button className="btn-outline" disabled={pageData.last} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </PageContainer>
    </div>
  );
}
