import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User as UserIcon, ChevronRight, FileText, Code, Eye, EyeOff, Edit3 } from 'lucide-react';

export default function Notes() {
  const { isAdmin } = useAuth();
  const [personalNotes, setPersonalNotes] = useState([]);
  const [adminNotes, setAdminNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleSolutions, setVisibleSolutions] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [personal, admin] = await Promise.all([
        api.get('/notes'),
        api.get('/problems?size=100')
      ]);
      setPersonalNotes(personal);
      setAdminNotes((admin.content || admin).filter(p => p.explanation || p.javaSolution));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleSolution = (id) => {
    setVisibleSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="page-section">
      <div style={{ marginBottom: '40px' }}>
        <p className="eyebrow dark">{isAdmin ? 'CONTENT MANAGEMENT' : 'KNOWLEDGE BASE'}</p>
        <h1>{isAdmin ? 'Notes & Materials Admin' : 'Study Center'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isAdmin 
            ? 'Review and manage the study materials and official explanations provided to students.' 
            : 'Access official Java study materials and your personal learning log.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <button 
          onClick={() => setActiveTab('admin')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'admin' ? 'var(--primary)' : '#888', 
            fontWeight: '700', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}
        >
          <BookOpen size={18} /> {isAdmin ? 'Review Official Notes' : 'Admin Study Notes'}
        </button>
        {!isAdmin && (
          <button 
            onClick={() => setActiveTab('personal')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'personal' ? 'var(--primary)' : '#888', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px'
            }}
          >
            <UserIcon size={18} /> My Notes
          </button>
        )}
      </div>

      {error && <p className="error-box">{error}</p>}
      {loading ? <p className="info-box">Loading materials...</p> : (
        <div className="list-grid" style={{ gridTemplateColumns: activeTab === 'admin' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {activeTab === 'admin' ? (
            adminNotes.length > 0 ? adminNotes.map(note => (
              <div key={note.id} className="note-card" style={{ padding: '30px', marginBottom: '20px', background: '#1e1e1e', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{note.category}</span>
                    <h2 style={{ color: '#fff', marginTop: '5px' }}>{note.title}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isAdmin ? (
                      <Link to={`/admin/problems/${note.id}/edit`} className="outline-btn" style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        <Edit3 size={14} /> Edit Notes
                      </Link>
                    ) : (
                      <Link to={`/problems/${note.id}`} className="outline-btn" style={{ fontSize: '13px', padding: '8px 16px' }}>Solve Problem</Link>
                    )}
                  </div>
                </div>
                
                {note.explanation && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Conceptual Explanation</h4>
                    <p style={{ color: '#ccc', lineHeight: '1.7', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>{note.explanation}</p>
                  </div>
                )}

                {note.javaSolution && (
                  <div>
                    <button 
                      onClick={() => toggleSolution(note.id)}
                      style={{ 
                        background: 'none', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#888', 
                        padding: '10px 20px', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {visibleSolutions[note.id] ? <><EyeOff size={16} /> Hide Implementation Code</> : <><Code size={16} /> View Implementation Code</>}
                    </button>
                    
                    {visibleSolutions[note.id] && (
                      <div style={{ marginTop: '15px', animation: 'fadeIn 0.3s ease' }}>
                        <pre style={{ background: '#000', padding: '20px', borderRadius: '12px', color: '#4caf50', overflowX: 'auto', border: '1px solid #222', fontSize: '14px' }}>
                          {note.javaSolution}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) : <p className="info-box">No study notes uploaded by admin yet.</p>
          ) : (
            personalNotes.length > 0 ? personalNotes.map(note => (
              <div className="note-card" key={note.id} style={{ padding: '24px', background: '#fff', color: '#0b0a1a' }}>
                <h3 style={{ marginBottom: '10px' }}>{note.problemTitle}</h3>
                <p style={{ color: '#4b5563', marginBottom: '20px', minHeight: '80px' }}>{note.note}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <small style={{ color: '#888' }}>{note.updatedAt?.slice(0, 10)}</small>
                  <Link to={`/problems/${note.problemId}`} className="card-link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open Problem <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )) : <p className="info-box">You haven't saved any personal notes yet.</p>
          )}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
