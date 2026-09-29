import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { Spinner } from './components/ui';

// Heavier pages (charts, code editor) load on demand to keep the first page fast.
const Problems = lazy(() => import('./pages/Problems'));
const ProblemDetails = lazy(() => import('./pages/ProblemDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Notes = lazy(() => import('./pages/Notes'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminProblems = lazy(() => import('./pages/AdminProblems'));
const ProblemForm = lazy(() => import('./pages/ProblemForm'));

export default function App() {
  const { pathname } = useLocation();
  // The problem workspace fills the screen like an IDE, so it has no footer.
  const isWorkspace = /^\/problems\/\d+/.test(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/admin/problems" element={<ProtectedRoute adminOnly><AdminProblems /></ProtectedRoute>} />
          <Route path="/admin/problems/new" element={<ProtectedRoute adminOnly><ProblemForm /></ProtectedRoute>} />
          <Route path="/admin/problems/:id/edit" element={<ProtectedRoute adminOnly><ProblemForm /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!isWorkspace && <Footer />}
    </div>
  );
}
