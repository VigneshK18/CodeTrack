import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, CheckCircle2, Bookmark, ChevronRight, Hash, Layers, Signal } from 'lucide-react';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [pageData, setPageData] = useState({ pageNumber: 0, totalPages: 1, last: true });
  const [solvedIds, setSolvedIds] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [page, setPage] = useState(0);
  
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [category, difficulty, page]);

  useEffect(() => {
    const handler = setTimeout(() => {
        setPage(0);
        loadData();
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  async function loadCategories() {
    try {
      const cats = await api.get('/problems/categories');
      setCategoriesList(['All', ...cats.filter(Boolean)]);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        size: 15,
        ...(search && { q: search }),
        ...(category !== 'All' && { category }),
        ...(difficulty !== 'All' && { difficulty })
      }).toString();

      const response = await api.get(`/problems?${queryParams}`);
      setProblems(response.content || []);
      setPageData({
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        last: response.last
      });

      if (user) {
        try {
          const solved = await api.get('/progress/solved-ids');
          const bookmarks = await api.get('/bookmarks/ids');
          setSolvedIds(solved || []);
          setBookmarkIds(bookmarks || []);
        } catch (subErr) {
          console.warn('Failed to load user progress or bookmarks', subErr);
          // Don't set the main error, just continue without user-specific markers
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.05), transparent 50%)', minHeight: '100vh' }}>
      <section className="page-section">
        <div className="section-title-row" style={{ marginBottom: '50px' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '14px', marginBottom: '16px' }}>Curated Library</p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-1px', color: '#fff' }}>Problem Library</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>Challenge yourself with hand-picked Java DSA challenges.</p>
          </div>
        </div>

        <div className="filters-container" style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          backdropFilter: 'blur(10px)',
          padding: '24px', 
          borderRadius: '24px', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          marginBottom: '40px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          alignItems: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={20} />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search problems..." 
              style={{ 
                padding: '14px 14px 14px 48px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                color: '#fff',
                borderRadius: '16px',
                fontSize: '15px'
              }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Layers style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={18} />
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setPage(0); }} 
              style={{ 
                padding: '14px 14px 14px 48px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                color: '#fff',
                borderRadius: '16px',
                fontSize: '15px',
                appearance: 'none'
              }}
            >
              {categoriesList.map(c => <option key={c} value={c} style={{ background: '#0b0a1a' }}>{c}</option>)}
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <Signal style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={18} />
            <select 
              value={difficulty} 
              onChange={(e) => { setDifficulty(e.target.value); setPage(0); }} 
              style={{ 
                padding: '14px 14px 14px 48px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                color: '#fff',
                borderRadius: '16px',
                fontSize: '15px',
                appearance: 'none'
              }}
            >
              {difficulties.map(d => <option key={d} value={d} style={{ background: '#0b0a1a' }}>{d}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="error-box" style={{ borderRadius: '16px', marginBottom: '24px' }}>{error}</div>}

        <div className="problems-table-container" style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '30px', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                <th style={{ padding: '24px 30px', width: '80px' }}>Status</th>
                <th style={{ padding: '24px 30px' }}>Problem Title</th>
                <th style={{ padding: '24px 30px' }}>Category</th>
                <th style={{ padding: '24px 30px' }}>Difficulty</th>
                <th style={{ padding: '24px 30px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span>Fetching problems...</span>
                  </div>
                </td></tr>
              ) : problems.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No problems found matching your criteria.
                </td></tr>
              ) : (
                problems.map((problem, idx) => {
                  const isSolved = solvedIds.includes(problem.id);
                  const isBookmarked = bookmarkIds.includes(problem.id);
                  return (
                    <tr key={problem.id} style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)', 
                      transition: 'all 0.2s ease',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                      <td style={{ padding: '20px 30px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {isSolved ? (
                            <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px' }}>
                              <CheckCircle2 size={16} />
                            </div>
                          ) : (
                            <div style={{ color: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                          {isBookmarked && (
                            <div style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '8px' }}>
                              <Bookmark size={16} fill="var(--warning)" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '20px 30px' }}>
                        <Link to={`/problems/${problem.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {problem.title}
                        </Link>
                      </td>
                      <td style={{ padding: '20px 30px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px' }}>{problem.category}</span>
                      </td>
                      <td style={{ padding: '20px 30px' }}>
                        <span className={`difficulty ${problem.difficulty?.toLowerCase()}`} style={{ fontSize: '12px', fontWeight: '800' }}>{problem.difficulty}</span>
                      </td>
                      <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                        <Link to={`/problems/${problem.id}`} className="solid-btn" style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '10px', gap: '8px' }}>
                          {isAdmin ? 'Verify' : 'Solve'} <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pageData.totalPages > 1 && (
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '50px', alignItems: 'center' }}>
            <button className="outline-btn" style={{ padding: '10px 24px' }} disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>{page + 1}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{pageData.totalPages}</span>
            </div>
            <button className="outline-btn" style={{ padding: '10px 24px' }} disabled={pageData.last} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </section>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
