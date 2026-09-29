import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Navbar';

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-slate-400 transition hover:text-white">
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            Practice Java data structures and algorithms, run your code against test cases, and track your progress topic by topic.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white">Platform</h4>
          <ul className="grid gap-3 text-sm">
            <FooterLink to="/problems">All problems</FooterLink>
            {user && <FooterLink to="/dashboard">{isAdmin ? 'Admin console' : 'Dashboard'}</FooterLink>}
            {user && <FooterLink to="/notes">{isAdmin ? 'Study notes' : 'My notes'}</FooterLink>}
            {user && !isAdmin && <FooterLink to="/bookmarks">Bookmarks</FooterLink>}
            {!user && <FooterLink to="/register">Create account</FooterLink>}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white">Built with</h4>
          <ul className="grid gap-3 text-sm text-slate-400">
            <li>React + Tailwind CSS</li>
            <li>Node.js + Express</li>
            <li>MySQL</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CodeTrack Java</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart size={14} className="fill-rose-500 text-rose-500" /> by{' '}
            <span className="font-semibold text-slate-300">Vignesh Kadiyala</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
