import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ExternalLink, Trash2, Bookmark } from 'lucide-react';

export default function Bookmarks() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      const data = await api.get('/bookmarks');
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(problemId) {
    try {
      await api.delete(`/bookmarks/${problemId}`);
      loadBookmarks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow dark">REVISION LIST</p>
          <h1>Bookmarked Problems</h1>
          <p>Challenges you've saved for later review.</p>
        </div>
      </div>

      {error && <p className="error-box">{error}</p>}

      <div className="bookmarks-container" style={{ marginTop: '30px', background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#282828', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '15px 20px', width: '50px' }}><Bookmark size={16} /></th>
              <th style={{ padding: '15px 20px' }}>Title</th>
              <th style={{ padding: '15px 20px' }}>Category</th>
              <th style={{ padding: '15px 20px' }}>Difficulty</th>
              <th style={{ padding: '15px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading bookmarks...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>You haven't bookmarked any problems yet.</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '15px 20px' }}><Bookmark size={18} color="#ff9800" fill="#ff9800" /></td>
                  <td style={{ padding: '15px 20px', fontWeight: '600', color: '#fff' }}>{item.problemTitle}</td>
                  <td style={{ padding: '15px 20px', color: '#aaa' }}>{item.category}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span className={`difficulty ${item.difficulty?.toLowerCase()}`}>{item.difficulty}</span>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                      <Link to={`/problems/${item.problemId}`} style={{ color: '#7567ff' }} title="Solve Now"><ExternalLink size={18} /></Link>
                      <button onClick={() => remove(item.problemId)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 0 }} title="Remove"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
