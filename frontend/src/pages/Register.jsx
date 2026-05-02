import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Basic Validation
    if (!form.name.trim()) return setError('Full name is required');
    if (!form.email.includes('@')) return setError('Please enter a valid email address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters long');

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <UserPlus size={30} color="var(--primary)" />
          </div>
          <p className="eyebrow dark">JOIN CODETRACK</p>
          <h1 style={{ color: '#0b0a1a' }}>Create Account</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              name="name" 
              required
              value={form.name} 
              onChange={handleChange} 
              placeholder="Full name" 
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              name="email" 
              type="email"
              required
              value={form.email} 
              onChange={handleChange} 
              placeholder="Email address" 
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              name="password" 
              type="password" 
              required
              minLength={6}
              value={form.password} 
              onChange={handleChange} 
              placeholder="Password (min. 6 characters)" 
              style={{ paddingLeft: '45px' }}
            />
          </div>
        </div>

        {error && <p className="error-box" style={{ marginTop: '20px' }}>{error}</p>}
        
        <button 
          className="solid-btn full" 
          disabled={loading}
          style={{ marginTop: '25px', height: '50px', fontSize: '16px' }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login</Link>
        </p>
      </form>
    </section>
  );
}
