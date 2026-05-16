// src/app/(dashboard)/layout.jsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import OrganizerService from '@/services/organizer.service';
import toast from 'react-hot-toast';  // ✅ already installed hai tumhare project mein

export default function DashboardLayout({ children }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [isCollapsed,  setIsCollapsed]  = useState(false);
  const [allowedPaths, setAllowedPaths] = useState(null);
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchAllowed = async () => {
      try {
        const data = await OrganizerService.getSidebarModules();
        const list = Array.isArray(data) ? data : (data?.data ?? []);

        const paths = list
          .filter(m => m.is_enabled && m.module_detail?.is_active)
          .map(m => {
            const p = m.module_detail?.path || '';
            return p.startsWith('/') ? p : `/${p}`;
          });

        paths.push('/dashboard');
        setAllowedPaths(paths);
      } catch {
        setAllowedPaths(['/dashboard']);
      }
    };

    fetchAllowed();
  }, [user]);

  // ✅ Route guard — toast message ke saath
  useEffect(() => {
    if (allowedPaths === null) return;

    const isAllowed = allowedPaths.some(p =>
      pathname === p || pathname.startsWith(`${p}/`)
    );

    if (!isAllowed) {
      // ✅ User ko clear message
      toast.error("You don't have access to this module. Contact your admin.", {
        duration: 4000,
        icon: '🔒',
        style: {
          borderRadius: '12px',
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '13px',
        },
      });
      router.replace('/dashboard');
    }
  }, [pathname, allowedPaths, router]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) setIsCollapsed(JSON.parse(saved));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (loading || allowedPaths === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:ml-[70px]' : 'md:ml-[220px]'}
      `}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}