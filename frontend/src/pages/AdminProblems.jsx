import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Edit3, Trash2, Plus, ExternalLink } from 'lucide-react';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  async function loadProblems() {
    try {
      const data = await api.get('/problems');
      setProblems(data.content || data); // Handle both paginated and list responses
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProblem(id) {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) return;
    try {
      await api.delete(`/problems/${id}`);
      loadProblems();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-section">
      <div className="section-title-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="eyebrow dark">ADMIN MANAGEMENT</p>
          <h1>Problem Library</h1>
          <p style={{ color: '#888' }}>Total Challenges: {problems.length}</p>
        </div>
        <Link to="/admin/problems/new" className="solid-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Problem
        </Link>
      </div>

      {error && <p className="error-box">{error}</p>}
      {loading ? <p className="info-box">Loading problem library...</p> : (
        <div className="admin-table-container" style={{ marginTop: '30px', background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#ccc' }}>
            <thead style={{ background: '#282828', color: '#fff', fontSize: '13px', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '15px 20px' }}>Title</th>
                <th style={{ padding: '15px 20px' }}>Category</th>
                <th style={{ padding: '15px 20px' }}>Difficulty</th>
                <th style={{ padding: '15px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '600', color: '#fff' }}>
                    {problem.title}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ padding: '4px 10px', background: '#333', borderRadius: '4px', fontSize: '12px' }}>{problem.category}</span>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <span className={`difficulty ${problem.difficulty?.toLowerCase()}`}>{problem.difficulty}</span>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <Link to={`/problems/${problem.id}`} title="View Problem" style={{ color: '#888' }}><ExternalLink size={18} /></Link>
                      <Link to={`/admin/problems/${problem.id}/edit`} title="Edit" style={{ color: '#2196f3' }}><Edit3 size={18} /></Link>
                      <button onClick={() => deleteProblem(problem.id)} title="Delete" style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 0 }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {problems.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No problems in library.</div>}
        </div>
      )}
    </section>
  );
}
