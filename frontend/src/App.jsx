import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetails from './pages/ProblemDetails';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookmarks from './pages/Bookmarks';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import AdminProblems from './pages/AdminProblems';
import ProblemForm from './pages/ProblemForm';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}
