import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount – try to refresh token
  useEffect(() => {
    const restoreSession = async () => {
      if (window.__haiq_access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${window.__haiq_access_token}`;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setLoading(false);
          return;
        } catch {
          window.__haiq_access_token = null;
          delete api.defaults.headers.common['Authorization'];
        }
      }
      // Attempt refresh
      try {
        const res = await api.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.access_token;
        if (newToken) {
          window.__haiq_access_token = newToken;
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          const me = await api.get('/auth/me');
          setUser(me.data.user);
        }
      } catch (e) {
        // No valid refresh token – stay logged out
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user } = res.data;
    window.__haiq_access_token = access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    window.__haiq_access_token = null;
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      requestPasswordReset, resetPassword,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}