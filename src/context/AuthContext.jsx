import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const remembered = localStorage.getItem('cl_remember') === 'true';

    if (token || remembered) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data.data.user))
        .catch(() => {
          sessionStorage.removeItem('accessToken');
          localStorage.removeItem('cl_remember');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for token expiry events from the axios interceptor
  useEffect(() => {
    const handle = () => {
      setUser(null);
      sessionStorage.removeItem('accessToken');
    };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const login = useCallback(async ({ username, password, rememberMe }) => {
    const { data } = await api.post('/auth/login', { username, password });
    const { user: u, accessToken } = data.data;
    sessionStorage.setItem('accessToken', accessToken);
    if (rememberMe) localStorage.setItem('cl_remember', 'true');
    else localStorage.removeItem('cl_remember');
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async ({ name, username, email, password }) => {
    const { data } = await api.post('/auth/register', { name, username, email, password });
    const { user: u, accessToken } = data.data;
    sessionStorage.setItem('accessToken', accessToken);
    setUser(u);
    return u;
  }, []);

  const loginWithToken = useCallback((accessToken, userData) => {
    sessionStorage.setItem('accessToken', accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('cl_remember');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
