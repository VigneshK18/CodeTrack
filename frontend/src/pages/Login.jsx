import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';
import AuthLayout from '../components/AuthLayout';

const DEMO = {
  user: { email: 'user@example.com', password: 'user123' },
  admin: { email: 'admin@example.com', password: 'admin123' }
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const reason = from?.startsWith('/problems/')
    ? "Log in to solve this problem. You'll go straight to it afterwards."
    : from
      ? 'Please log in to continue.'
      : '';

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to CodeTrack">
      <Alert type="info" className="mb-5">{reason}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input name="email" type="email" required autoComplete="email" value={form.email} onChange={onChange} placeholder="Email" aria-label="Email" className="input pl-11" />
        </div>
        <div className="relative">
          <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input name="password" type="password" required autoComplete="current-password" value={form.password} onChange={onChange} placeholder="Password" aria-label="Password" className="input pl-11" />
        </div>

        <Alert type="error">{error}</Alert>

        <button className="btn-primary w-full py-3" disabled={loading}>
          <LogIn size={18} /> {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Try a demo account</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm(DEMO.user)} className="btn-outline py-2 text-xs">Student demo</button>
          <button type="button" onClick={() => setForm(DEMO.admin)} className="btn-outline py-2 text-xs">Admin demo</button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-brand-400 hover:text-brand-300">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
