import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookMarked, Box, Code2, Database, LayoutDashboard, LogOut, Menu, StickyNote, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`;

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="CodeTrack home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-purple-500 shadow-glow">
        <Code2 size={20} className="text-white" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-tight text-white">CodeTrack</span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-400">Java Platform</span>
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const links = (
    <>
      <NavLink to="/problems" className={linkClass} onClick={() => setOpen(false)}>
        <Box size={16} /> Problems
      </NavLink>
      {user && (
        <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
          {isAdmin ? <Database size={16} /> : <LayoutDashboard size={16} />} {isAdmin ? 'Admin Console' : 'Dashboard'}
        </NavLink>
      )}
      {user && (
        <NavLink to="/notes" className={linkClass} onClick={() => setOpen(false)}>
          <StickyNote size={16} /> Notes
        </NavLink>
      )}
      {user && !isAdmin && (
        <NavLink to="/bookmarks" className={linkClass} onClick={() => setOpen(false)}>
          <BookMarked size={16} /> Bookmarks
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 text-sm font-semibold transition hover:border-brand-500/50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600">
                  <User size={14} className="text-white" />
                </span>
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-400 transition hover:bg-rose-500/20"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-white/5 bg-ink-950 px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <div className="mt-4 flex gap-3 border-t border-white/5 pt-4">
            {user ? (
              <>
                <Link to="/profile" className="btn-outline flex-1" onClick={() => setOpen(false)}>
                  <User size={16} /> {user.name}
                </Link>
                <button onClick={handleLogout} className="btn-outline text-rose-300">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
