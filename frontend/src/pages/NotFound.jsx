import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="bg-linear-to-br from-white to-brand-400 bg-clip-text text-8xl font-black text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Go home</Link>
    </section>
  );
}
