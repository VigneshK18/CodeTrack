import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/problems?size=100')
      .then((data) => setProblems(data.content || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? problems.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(q)) : problems;
  }, [problems, filter]);

  async function deleteProblem(problem) {
    if (!confirm(`Delete "${problem.title}"? Students' progress, notes and bookmarks for it are deleted too.`)) return;
    try {
      await api.delete(`/problems/${problem.id}`);
      setProblems((list) => list.filter((p) => p.id !== problem.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin"
        title="Manage problems"
        subtitle={`${problems.length} problems in the library`}
        actions={<Link to="/admin/problems/new" className="btn-primary"><Plus size={16} /> Add problem</Link>}
      />

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by title or topic..." className="input pl-11" aria-label="Filter problems" />
      </div>

      <Alert type="error" className="mb-6">{error}</Alert>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading library..." />
        ) : visible.length === 0 ? (
          <EmptyState title="No problems found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="hidden px-6 py-4 md:table-cell">Topic</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-mono text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{p.title}</td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <span className="rounded-lg bg-white/5 px-3 py-1 text-slate-300">{p.category}</span>
                    </td>
                    <td className="px-6 py-4"><DifficultyBadge level={p.difficulty} /></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Link to={`/problems/${p.id}`} className="btn-ghost p-2" title="View" aria-label={`View ${p.title}`}><ExternalLink size={16} /></Link>
                        <Link to={`/admin/problems/${p.id}/edit`} className="btn-ghost p-2 text-sky-400" title="Edit" aria-label={`Edit ${p.title}`}><Edit3 size={16} /></Link>
                        <button onClick={() => deleteProblem(p)} className="btn-ghost p-2 text-rose-400" title="Delete" aria-label={`Delete ${p.title}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
