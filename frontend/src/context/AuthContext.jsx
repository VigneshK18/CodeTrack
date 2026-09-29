import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearAuth, getStoredUser, getToken, saveAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  // On load, confirm the stored token is still valid; clear it if the server rejects it.
  useEffect(() => {
    if (!getToken() || !user) return;
    api.get('/auth/profile').catch((err) => {
      if (err.status === 401 || err.status === 403) {
        clearAuth();
        setUser(null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAuth(data) {
    saveAuth(data);
    setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role });
    return data;
  }

  const login = async (email, password) => applyAuth(await api.post('/auth/login', { email, password }));
  const register = async (name, email, password) => applyAuth(await api.post('/auth/register', { name, email, password }));

  function logout() {
    clearAuth();
    setUser(null);
  }

  const isAdmin = user?.role === 'ADMIN';

  return <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
