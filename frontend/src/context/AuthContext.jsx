import { createContext, useContext, useState, useEffect } from 'react';
import api, { logout as logoutApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('gh_token'));
  const [loading, setLoading] = useState(true);

  /* On mount — verify the stored token (or httpOnly cookie) */
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    /* Always call /auth/me; if a valid httpOnly cookie exists the server
       will accept it even when there is no localStorage token. */
    api.get('/auth/me')
      .then(r => setUser(r.data.data))
      .catch(() => {
        localStorage.removeItem('gh_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, tkn) => {
    /* Persist token in localStorage AND as an Authorization header.
       The server also sets an httpOnly cookie automatically. */
    localStorage.setItem('gh_token', tkn);
    api.defaults.headers.common['Authorization'] = `Bearer ${tkn}`;
    setToken(tkn);
    setUser(userData);
  };

  const logout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    localStorage.removeItem('gh_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
