import { Globe, Cpu, MessageSquare, Heart, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  return (
    <footer className="footer" style={{ 
      background: 'rgba(11, 10, 26, 1)',
      borderTop: '1px solid var(--glass-border)', 
      padding: '80px 7% 40px' 
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px', textAlign: 'left' }}>
        <div style={{ maxWidth: '350px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px' }}>
              <Code2 size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>CodeTrack</span>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
            The ultimate platform for mastering Java Data Structures & Algorithms. Built by developers, for developers who strive for excellence.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <SocialIcon icon={<MessageSquare size={18} />} />
            <SocialIcon icon={<Code2 size={18} />} />
            <SocialIcon icon={<Globe size={18} />} />
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '15px', display: 'grid', gap: '12px' }}>
            <li><FooterLink to="/problems" label="All Problems" /></li>
            {isAdmin ? (
              <>
                <li><FooterLink to="/dashboard" label="Admin Console" /></li>
                <li><FooterLink to="/notes" label="Manage Library Notes" /></li>
              </>
            ) : (
              <>
                <li><FooterLink to="/dashboard" label="User Dashboard" /></li>
                <li><FooterLink to="/notes" label="My Notes" /></li>
                <li><FooterLink to="/bookmarks" label="Saved Solutions" /></li>
              </>
            )}
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Community</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '15px', display: 'grid', gap: '12px' }}>
            <li><FooterLink to="/register" label="Join Discord" /></li>
            <li><FooterLink to="/problems" label="Global Rankings" /></li>
            <li><FooterLink to="/register" label="Success Stories" /></li>
          </ul>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '80px', 
        paddingTop: '32px', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px',
        color: 'var(--text-muted)'
      }}>
        <p style={{ fontSize: '14px' }}>© 2026 CodeTrack Java. All rights reserved.</p>
        <p style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> by <span style={{ color: '#fff', fontWeight: '600' }}>Vignesh Kadiyala</span>
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }) {
  return (
    <Link to={to} style={{ 
      color: 'var(--text-muted)', 
      transition: 'color 0.2s ease',
      display: 'inline-block'
    }}
    onMouseEnter={(e) => e.target.style.color = '#fff'}
    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
      {label}
    </Link>
  );
}

function SocialIcon({ icon }) {
  return (
    <a href="#" style={{ 
      width: '40px', 
      height: '40px', 
      borderRadius: '12px', 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'var(--text-muted)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--primary)';
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.borderColor = 'var(--primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
    }}>
      {icon}
    </a>
  );
}
