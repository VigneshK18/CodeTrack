import { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, List, Settings } from 'lucide-react';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/progress/stats')
      .then(setStats)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <section className="page-section"><p className="error-box">{error}</p></section>;
  if (!stats) return <section className="page-section"><p className="info-box">Loading dashboard...</p></section>;

  if (isAdmin) {
    const categoryData = Object.entries(stats.categoryTotals || {}).map(([name, total]) => ({
      name,
      total
    }));

    return (
      <section className="page-section">
        <p className="eyebrow dark">ADMIN CONSOLE</p>
        <h1>Management Dashboard</h1>
        <p>Control content and monitor library health.</p>

        <div className="stats-grid" style={{ marginTop: '30px' }}>
          <StatCard label="Total Problems in Library" value={stats.totalProblems} />
          <StatCard label="Active Categories" value={Object.keys(stats.categoryTotals || {}).length} />
          <StatCard label="System Status" value="Online" helper="Operational" />
        </div>

        <div className="admin-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
          <Link to="/admin/problems/new" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333' }}>
              <PlusCircle size={40} color="#7567ff" />
              <h3 style={{ marginTop: '15px', color: '#fff' }}>Add New Problem</h3>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Create new challenges with test cases.</p>
            </div>
          </Link>
          <Link to="/admin/problems" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333' }}>
              <List size={40} color="#00c9ff" />
              <h3 style={{ marginTop: '15px', color: '#fff' }}>Manage Library</h3>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Edit or delete existing problems.</p>
            </div>
          </Link>
          <div className="action-card">
            <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333', opacity: 0.7 }}>
              <Settings size={40} color="#888" />
              <h3 style={{ marginTop: '15px', color: '#fff' }}>Platform Settings</h3>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Configure system preferences.</p>
            </div>
          </div>
        </div>

        <div className="chart-card" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', marginTop: '30px', border: '1px solid #333' }}>
          <h3>Library Composition (Problems per Category)</h3>
          <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fill: '#aaa'}} />
                <YAxis tick={{fill: '#aaa'}} />
                <Tooltip cursor={{fill: '#333'}} contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                <Bar dataKey="total" fill="#7567ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    );
  }

  // User Dashboard
  const percentage = stats.totalProblems ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0;
  const difficultyData = [
    { name: 'Easy', value: stats.easySolved, color: '#4caf50' },
    { name: 'Medium', value: stats.mediumSolved, color: '#ff9800' },
    { name: 'Hard', value: stats.hardSolved, color: '#f44336' },
  ].filter(d => d.value > 0);

  const categoryProgressData = Object.entries(stats.categoryTotals || {}).map(([name, total]) => ({
    name,
    solved: stats.categorySolved?.[name] || 0,
    total
  }));

  return (
    <section className="page-section">
      <p className="eyebrow dark">MY PROGRESS</p>
      <h1>Dashboard 2.0</h1>
      <p>Advanced metrics and recent activities tracking.</p>

      <div className="stats-grid">
        <StatCard label="Total Problems" value={stats.totalProblems} />
        <StatCard label="Solved Problems" value={stats.solvedProblems} helper={`${percentage}% completed`} />
        <StatCard label="Current Streak" value={stats.currentStreak} helper="days" />
      </div>

      <div className="progress-card">
        <h2>Overall Progress</h2>
        <div className="progress-bar"><span style={{ width: `${percentage}%` }}></span></div>
        <p>{percentage}% completed</p>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '30px' }}>
        <div className="chart-card" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3>Difficulty Breakdown</h3>
          <div style={{ height: 250, width: '100%' }}>
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {difficultyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#aaa', marginTop: '20px' }}>No problems solved yet.</p>}
          </div>
        </div>

        <div className="chart-card" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3>Category Progress</h3>
          <div style={{ height: 250, width: '100%' }}>
            {categoryProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{fill: '#888'}} />
                  <YAxis dataKey="name" type="category" width={100} tick={{fill: '#ccc'}} />
                  <Tooltip cursor={{fill: '#333'}} contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                  <Bar dataKey="solved" fill="#2196f3" name="Solved" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: '#aaa', marginTop: '20px' }}>No categories available.</p>}
          </div>
        </div>
      </div>

      <div className="heatmap-card" style={{ marginTop: '30px', background: '#1e1e1e', padding: '30px', borderRadius: '24px', border: '1px solid #333', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontSize: '24px', fontWeight: '900' }}>{stats.solvedProblems || 0}</span> submissions in the past one year
          </h3>
          <div style={{ display: 'flex', gap: '24px', color: '#888', fontSize: '14px' }}>
            <span>Total active days: <strong>{Array.isArray(stats.submissionDates) ? stats.submissionDates.length : 0}</strong></span>
            <span>Max streak: <strong>{stats.currentStreak || 0}</strong></span>
          </div>
        </div>

        <div className="heatmap-container" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 53 }).map((_, weekIdx) => {
              const weekDate = new Date();
              weekDate.setDate(weekDate.getDate() - (52 - weekIdx) * 7);
              // Ensure we show month labels when the month actually changes
              const prevWeekDate = new Date(weekDate);
              prevWeekDate.setDate(prevWeekDate.getDate() - 7);
              const monthLabel = (weekIdx === 0 || weekDate.getMonth() !== prevWeekDate.getMonth()) 
                ? weekDate.toLocaleString('default', { month: 'short' }) 
                : '';
              
              return (
                <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const dayDate = new Date(weekDate);
                    dayDate.setDate(weekDate.getDate() - weekDate.getDay() + dayIdx);
                    
                    const y = dayDate.getFullYear();
                    const m = String(dayDate.getMonth() + 1).padStart(2, '0');
                    const d = String(dayDate.getDate()).padStart(2, '0');
                    const dateStr = `${y}-${m}-${d}`;
                    const isActive = stats.submissionDates?.includes(dateStr);
                    
                    return (
                      <div 
                        key={dayIdx} 
                        title={dateStr}
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '2px', 
                          background: isActive ? '#ff9800' : 'rgba(255,255,255,0.05)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    );
                  })}
                  {monthLabel && <span style={{ fontSize: '10px', color: '#555', marginTop: '4px', fontWeight: '700' }}>{monthLabel}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="recent-activity" style={{ marginTop: '30px', background: '#1e1e1e', padding: '25px', borderRadius: '16px', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <List size={20} color="var(--primary)" /> Recent Activity
        </h3>
        {stats.recentActivities && stats.recentActivities.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {stats.recentActivities.map(act => (
              <li key={act.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #2a2a2a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`difficulty ${act.difficulty.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{act.difficulty}</span>
                  <Link to={`/problems/${act.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: '600' }}>{act.title}</Link>
                </div>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {new Date(act.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        ) : <p style={{ color: '#888', marginTop: '10px' }}>No recent activity.</p>}
      </div>
    </section>
  );
}
