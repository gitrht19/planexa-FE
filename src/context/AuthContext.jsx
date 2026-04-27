'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('plannexa_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      localStorage.removeItem('plannexa_user');
    } finally {
      setLoading(false);
    }
  }, []);

const login = async (credentials) => {
  const response = await AuthService.login(credentials);

  // ✅ Backend ka actual response structure
  // Network tab mein dekha tha — adjust karo
  const userData =
    response?.data?.user ||
    response?.user ||
    response?.data ||
    response;

  setUser(userData);
  localStorage.setItem('plannexa_user', JSON.stringify(userData));
  return userData;
};

  const logout = async () => {
    try { await AuthService.logout(); } catch (e) {}
    setUser(null);
    localStorage.removeItem('plannexa_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);