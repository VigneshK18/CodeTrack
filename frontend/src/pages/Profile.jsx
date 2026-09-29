import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CalendarDays, CheckCircle2, Mail, Shield, StickyNote } from 'lucide-react';
import { api } from '../services/api';
import { Alert, PageContainer, PageHeader, Spinner } from '../components/ui';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="rounded-lg bg-white/5 p-2 text-slate-400"><Icon size={18} /></span>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/profile').then(setProfile).catch((err) => setError(err.message));
  }, []);

  if (error) return <PageContainer><Alert type="error">{error}</Alert></PageContainer>;
  if (!profile) return <Spinner label="Loading profile..." className="min-h-[60vh]" />;

  const initials = profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const isAdmin = profile.role === 'ADMIN';

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="card p-8">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 to-purple-500 text-xl font-black text-white shadow-glow">
            {initials}
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${isAdmin ? 'bg-brand-600/20 text-brand-300' : 'bg-white/5 text-slate-300'}`}>
              {profile.role}
            </span>
          </div>
        </div>

        <div className="mt-6 divide-y divide-white/5 border-t border-white/5">
          <Row icon={Mail} label="Email" value={profile.email} />
          <Row icon={Shield} label="Role" value={isAdmin ? 'Administrator' : 'Student'} />
          <Row icon={CalendarDays} label="Joined" value={new Date(profile.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link to="/dashboard" className="card p-5 transition hover:border-brand-500/50">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="mt-3 text-3xl font-extrabold text-white">{profile.solvedCount}</p>
            <p className="text-sm text-slate-400">Problems solved</p>
          </Link>
          <Link to="/notes" className="card p-5 transition hover:border-brand-500/50">
            <StickyNote size={18} className="text-brand-400" />
            <p className="mt-3 text-3xl font-extrabold text-white">{profile.notesCount}</p>
            <p className="text-sm text-slate-400">Notes written</p>
          </Link>
          <Link to="/bookmarks" className="card p-5 transition hover:border-brand-500/50">
            <Bookmark size={18} className="text-amber-400" />
            <p className="mt-3 text-3xl font-extrabold text-white">{profile.bookmarksCount}</p>
            <p className="text-sm text-slate-400">Bookmarks</p>
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
