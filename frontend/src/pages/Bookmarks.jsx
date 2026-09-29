import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Alert, DifficultyBadge, EmptyState, PageContainer, PageHeader, Spinner } from '../components/ui';

export default function Bookmarks() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/bookmarks')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function remove(problemId) {
    try {
      await api.delete(`/bookmarks/${problemId}`);
      setItems((list) => list.filter((i) => i.problemId !== problemId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageContainer>
      <PageHeader eyebrow="Revision list" title="Bookmarks" subtitle="Problems you saved to come back to before interviews." />
      <Alert type="error" className="mb-6">{error}</Alert>

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner label="Loading bookmarks..." />
        ) : items.length === 0 ? (
          <EmptyState icon={<Bookmark size={24} />} title="No bookmarks yet">
            Use the bookmark button on any problem to add it to your revision list.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Problem</th>
                  <th className="hidden px-6 py-4 sm:table-cell">Topic</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="hidden px-6 py-4 md:table-cell">Saved</th>
                  <th className="px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Bookmark size={16} className="shrink-0 fill-amber-400 text-amber-400" />
                        <Link to={`/problems/${item.problemId}`} className="font-semibold text-white hover:text-brand-300">{item.problemTitle}</Link>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-slate-400 sm:table-cell">{item.category}</td>
                    <td className="px-6 py-4"><DifficultyBadge level={item.difficulty} /></td>
                    <td className="hidden px-6 py-4 text-slate-500 md:table-cell">{item.createdAt?.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Link to={`/problems/${item.problemId}`} className="btn-ghost p-2" title="Solve now" aria-label="Solve now"><ExternalLink size={16} /></Link>
                        <button onClick={() => remove(item.problemId)} className="btn-ghost p-2 text-rose-400 hover:text-rose-300" title="Remove" aria-label={`Remove ${item.problemTitle}`}>
                          <Trash2 size={16} />
                        </button>
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
