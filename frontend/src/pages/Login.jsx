import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin123' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-section" style={{ background: 'radial-gradient(circle at center, #1e1e3f 0%, #151335 100%)' }}>
      <form onSubmit={handleSubmit} className="auth-card" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px' }}>
        <p className="eyebrow dark" style={{ color: '#7567ff' }}>SECURE ACCESS</p>
        <h1 style={{ color: '#fff', marginBottom: '30px' }}>Welcome Back</h1>
        
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <Mail style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={{ paddingLeft: '45px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff' }} />
        </div>

        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" style={{ paddingLeft: '45px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff' }} />
        </div>

        {error && <p className="error-box" style={{ marginTop: '10px' }}>{error}</p>}
        
        <button className="solid-btn full" style={{ marginTop: '20px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <LogIn size={18} /> Login to Account
        </button>
        
        <p style={{ marginTop: '25px', textAlign: 'center', color: '#888' }}>
          Don't have an account? <Link to="/register" style={{ color: '#7567ff', fontWeight: 'bold' }}>Create one now</Link>
        </p>
      </form>
    </section>
  );
}
