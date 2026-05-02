import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Code2, User, LogOut, LayoutDashboard, Database, BookMarked, StickyNote, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), #a855f7)', 
          padding: '8px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 16px -4px var(--primary-glow)'
        }}>
          <Code2 size={22} color="#fff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.8px', color: '#fff' }}>CodeTrack</span>
          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Java Platform</span>
        </div>
      </Link>

      <div className="nav-links">
        {user && (
          <NavLink to="/problems" className={({isActive}) => isActive ? 'active' : ''}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Box size={16} /> Problems</div>
          </NavLink>
        )}
        {user && !isAdmin && <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={16} /> Dashboard</div></NavLink>}
        {isAdmin && <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={16} /> Admin Console</div></NavLink>}
        {user && <NavLink to="/notes" className={({isActive}) => isActive ? 'active' : ''}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><StickyNote size={16} /> Notes</div></NavLink>}
      </div>

      <div className="nav-actions">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/profile" className="user-pill" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</span>
            </Link>
            <button onClick={handleLogout} style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="outline-btn" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>Login</Link>
            <Link to="/register" className="solid-btn" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
