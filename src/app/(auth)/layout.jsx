'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ✅ Sirf tab redirect karo jab loading khatam ho aur user exist kare
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user]);

  // ✅ Loading aur user dono nahi hain tab hi children dikhao
  // Loading ke time bhi children dikhao — spinner mat dikhao yahan
  return <>{children}</>;
}