import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { SplitPane } from 'react-split-pane';
import { api } from '../services/api';

export default function CodeEditor({ initialCode, problemId, defaultTemplate }) {
  const [code, setCode] = useState(defaultTemplate || initialCode || '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' or 'result'

  useEffect(() => {
    if (defaultTemplate) {
        setCode(defaultTemplate);
    }
  }, [defaultTemplate]);

  async function handleRunCode() {
    setIsRunning(true);
    setError('');
    setActiveTab('result');
    try {
      const response = await api.post('/execution/run', { code, problemId });
      setResults(response);
    } catch (err) {
      setError(err.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="leetcode-editor-container" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="editor-controls" style={{ padding: '8px 15px', background: '#2d2d2d', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={handleRunCode} disabled={isRunning} className="solid-btn btn-sm" style={{ padding: '4px 12px', fontSize: '14px' }}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <SplitPane split="vertical" defaultSize="70%" minSize="30%">
          <div style={{ height: '100%', background: '#1e1e1e' }}>
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 10 },
                automaticLayout: true
              }}
            />
          </div>
          
          <div className="console-pane" style={{ height: '100%', background: '#1e1e1e', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            <div className="console-tabs" style={{ display: 'flex', background: '#252525', borderBottom: '1px solid #333' }}>
              <button 
                onClick={() => setActiveTab('testcase')}
                style={{ padding: '8px 15px', background: activeTab === 'testcase' ? '#333' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderBottom: activeTab === 'testcase' ? '2px solid #2196f3' : 'none' }}>
                Console
              </button>
              <button 
                onClick={() => setActiveTab('result')}
                style={{ padding: '8px 15px', background: activeTab === 'result' ? '#333' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderBottom: activeTab === 'result' ? '2px solid #2196f3' : 'none' }}>
                Result
              </button>
            </div>

            <div className="console-content" style={{ flex: 1, padding: '15px', overflowY: 'auto', color: '#ccc' }}>
              {activeTab === 'testcase' && (
                <div>
                   <p style={{ fontSize: '14px', color: '#888' }}>Run code to see test case output.</p>
                </div>
              )}

              {activeTab === 'result' && (
                <div className="results-view">
                  {isRunning ? <p>Executing test cases...</p> : error ? <p className="error-box">{error}</p> : results ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                         <h3 style={{ color: results.allPassed ? '#4caf50' : '#f44336', margin: 0 }}>
                            {results.allPassed ? 'Accepted' : 'Wrong Answer'}
                         </h3>
                         <span style={{ fontSize: '13px', background: '#333', padding: '2px 8px', borderRadius: '4px' }}>
                            Runtime: 12ms
                         </span>
                      </div>

                      {results.error && <pre style={{ color: '#f44336', background: '#000', padding: '10px' }}>{results.error}</pre>}

                      {results.testResults && results.testResults.map((tr, idx) => (
                        <div key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong>Test Case {idx + 1}</strong>
                            <span style={{ color: tr.passed ? '#4caf50' : '#f44336' }}>{tr.passed ? '✔ Passed' : '✘ Failed'}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                            <div>
                               <label style={{ color: '#888' }}>Input:</label>
                               <pre style={{ background: '#000', padding: '5px', marginTop: '3px' }}>{tr.input}</pre>
                            </div>
                            <div>
                               <label style={{ color: '#888' }}>Expected:</label>
                               <pre style={{ background: '#000', padding: '5px', marginTop: '3px' }}>{tr.expectedOutput}</pre>
                            </div>
                            {tr.actualOutput && (
                              <div style={{ gridColumn: 'span 2' }}>
                                 <label style={{ color: tr.passed ? '#888' : '#f44336' }}>Actual Output:</label>
                                 <pre style={{ background: '#000', padding: '5px', marginTop: '3px' }}>{tr.actualOutput}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!results.testResults && results.output && (
                        <pre style={{ color: '#4caf50', background: '#000', padding: '10px' }}>{results.output}</pre>
                      )}
                    </div>
                  ) : <p style={{ color: '#888' }}>No results yet.</p>}
                </div>
              )}
            </div>
          </div>
        </SplitPane>
      </div>
    </div>
  );
}
