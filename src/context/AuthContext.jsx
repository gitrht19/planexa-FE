'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false); // ✅

  useEffect(() => {
    try {
      const stored = localStorage.getItem('plannexa_user');
      if (stored) setUser(JSON.parse(stored));

      const pending = localStorage.getItem('plannexa_pending');
      if (pending) setIsPending(true); // ✅
    } catch (e) {
      localStorage.removeItem('plannexa_user');
    } finally {
      setLoading(false);
    }
  }, []);


const login = async (credentials) => {
  const response = await AuthService.login(credentials);
  console.log('RESPONSE:', JSON.stringify(response));  // add karo

  if (response.pending) {
    setIsPending(true);
    localStorage.setItem('plannexa_pending', 'true');
    return { pending: true };
  }

const userData = response?.data?.data;

  console.log('userData:', userData); // 🔍 debug

  if (!userData) {
    throw new Error('User data not found in response');
  }

  setIsPending(false);
  localStorage.removeItem('plannexa_pending');
  setUser(userData);
  localStorage.setItem('plannexa_user', JSON.stringify(userData));

document.cookie = `is_logged_in=true; path=/; max-age=${7 * 24 * 60 * 60}`;
document.cookie = `user_role=${userData.role}; path=/; max-age=${7 * 24 * 60 * 60}`; 
  return { pending: false, user: userData };
};
  const logout = async () => {
    try { await AuthService.logout(); } catch (e) { }
    setUser(null);
    setIsPending(false);
    localStorage.removeItem('plannexa_user');
    localStorage.removeItem('plannexa_pending');
    // ✅ Cookie bhi hatao
    document.cookie = 'is_logged_in=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);