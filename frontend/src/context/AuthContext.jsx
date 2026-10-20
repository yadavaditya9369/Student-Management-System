import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const login = async (credentials) => { const { data } = await api.post('/auth/login', credentials); setUser(data.user); return data.user; };
  const register = async (credentials) => { const { data } = await api.post('/auth/register', credentials); setUser(data.user); return data.user; };
  const logout = async () => { await api.post('/auth/logout'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
