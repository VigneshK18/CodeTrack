import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { clearAuth, getStoredUser, saveAuth, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [authChecked, setAuthChecked] = useState(false);

  // On mount, verify the stored token is still valid against the backend
  useEffect(() => {
    async function validateSession() {
      const token = getToken();
      if (token && user) {
        try {
          // Try a lightweight authenticated request to validate the session
          await api.get('/progress/solved-ids');
        } catch (err) {
          // If it fails (401/403 or network error after backend restart), clear stale session
          if (err.message === 'Request failed' || err.message?.includes('401') || err.message?.includes('403')) {
            clearAuth();
            setUser(null);
          }
        }
      }
      setAuthChecked(true);
    }
    validateSession();
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    saveAuth(data);
    setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role });
    return data;
  }

  async function register(name, email, password) {
    const data = await api.post('/auth/register', { name, email, password });
    saveAuth(data);
    setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role });
    return data;
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
