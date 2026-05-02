import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SplitPane } from 'react-split-pane';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';

export default function ProblemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProblem();
  }, [id]);

  async function loadProblem() {
    try {
      const data = await api.get(`/problems/${id}`);
      setProblem(data);
      if (user) {
        try {
          const noteData = await api.get(`/notes/${id}`);
          setNote(noteData.note || '');
        } catch {
          setNote('');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    if (!user) return setError('Login required to save notes');
    try {
      await api.post(`/notes/${id}`, { note });
      setMessage('Note saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save note');
    }
  }

  if (loading) return <section className="page-section"><p className="info-box">Loading problem...</p></section>;
  if (error && !problem) return <section className="page-section"><p className="error-box">{error}</p></section>;

  return (
    <div className="details-layout">
      <SplitPane 
        split="vertical" 
        minSize={300} 
        defaultSize="45%" 
        style={{ position: 'relative' }} 
        paneStyle={{ overflow: 'hidden' }}
      >
        <div className="problem-info-pane">
          <div className="pane-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('description')} 
              className={activeTab === 'description' ? 'active' : ''}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'description' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('solution')} 
              className={activeTab === 'solution' ? 'active' : ''}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'solution' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
            >
              Solution
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              className={activeTab === 'notes' ? 'active' : ''}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'notes' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
            >
              Notes
            </button>
          </div>

          <div className="pane-content">
            {activeTab === 'description' && (
              <div>
                <Link to="/problems" className="back-link" style={{ fontSize: '13px', color: '#888', marginBottom: '15px', display: 'block' }}>← All Problems</Link>
                <div style={{ marginBottom: '20px' }}>
                   <h1 style={{ marginBottom: '5px' }}>{problem.title}</h1>
                   <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#888' }}>
                      <span className={`difficulty ${problem.difficulty?.toLowerCase()}`} style={{ fontWeight: '600' }}>{problem.difficulty}</span>
                      <span>Category: {problem.category}</span>
                   </div>
                </div>

                <div className="description-text" style={{ color: '#ccc', lineHeight: '1.6' }}>
                  {problem.description}
                </div>

                <InfoBlock title="Input Format" text={problem.inputFormat} />
                <InfoBlock title="Output Format" text={problem.outputFormat} />
                <InfoBlock title="Constraints" text={problem.constraintsText} />

                <div className="sample-grid" style={{ marginTop: '20px' }}>
                  <InfoBlock title="Sample Input" text={problem.sampleInput} pre />
                  <InfoBlock title="Sample Output" text={problem.sampleOutput} pre />
                </div>
                
                {problem.explanation && <InfoBlock title="Explanation" text={problem.explanation} />}
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="solution-pane">
                <h2>Official Java Solution</h2>
                <div className="meta-row" style={{ marginBottom: '15px' }}>
                  <span>Time: {problem.timeComplexity}</span> | <span>Space: {problem.spaceComplexity}</span>
                </div>
                <pre style={{ background: '#000', padding: '15px', borderRadius: '4px', color: '#4caf50', overflowX: 'auto' }}>
                  {problem.javaSolution || 'No solution available yet.'}
                </pre>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-pane">
                <h2>My Notes</h2>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Write your logic or pseudocode here..."
                  style={{ width: '100%', height: '300px', background: '#121212', border: '1px solid #333', color: '#fff', padding: '15px', borderRadius: '4px', resize: 'none', marginTop: '10px' }}
                />
                <button onClick={saveNote} className="solid-btn" style={{ marginTop: '15px' }}>Save Note</button>
                {message && <p className="success-box" style={{ marginTop: '10px' }}>{message}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="problem-editor-pane" style={{ height: '100%' }}>
           <CodeEditor 
             initialCode={problem.javaSolution} 
             problemId={problem.id} 
             defaultTemplate={problem.defaultCodeTemplate}
           />
        </div>
      </SplitPane>
    </div>
  );
}

function InfoBlock({ title, text, pre }) {
  if (!text) return null;
  return (
    <div className="info-block" style={{ borderRadius: '16px', padding: '24px', marginTop: '16px' }}>
      <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', marginBottom: '14px', textTransform: 'none' }}>{title}</h3>
      {pre ? (
        <pre style={{ 
          background: '#000', 
          padding: '18px', 
          borderRadius: '12px', 
          color: '#4ade80', 
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          border: '1px solid rgba(255,255,255,0.05)',
          overflowX: 'auto',
          lineHeight: '1.5'
        }}>
          {text}
        </pre>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6' }}>{text}</p>
      )}
    </div>
  );
}
