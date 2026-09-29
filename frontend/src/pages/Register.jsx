import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Full name is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate(from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: 'name', type: 'text', icon: User, placeholder: 'Full name', autoComplete: 'name' },
    { name: 'email', type: 'email', icon: Mail, placeholder: 'Email address', autoComplete: 'email' },
    { name: 'password', type: 'password', icon: Lock, placeholder: 'Password (min. 6 characters)', autoComplete: 'new-password', minLength: 6 }
  ];

  return (
    <AuthLayout eyebrow="Join CodeTrack" title="Create your account">
      <Alert type="info" className="mb-5">{from?.startsWith('/problems/') ? "Create a free account to solve this problem. You'll go straight to it afterwards." : ''}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ icon: Icon, ...f }) => (
          <div key={f.name} className="relative">
            <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input {...f} required value={form[f.name]} onChange={onChange} aria-label={f.placeholder} className="input pl-11" />
          </div>
        ))}

        <Alert type="error">{error}</Alert>

        <button className="btn-primary w-full py-3" disabled={loading}>
          <UserPlus size={18} /> {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-400 hover:text-brand-300">Log in</Link>
      </p>
    </AuthLayout>
  );
}
