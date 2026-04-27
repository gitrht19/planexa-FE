'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Outside click close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful!');
      router.push('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">

      {/* Left — Mobile menu + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-gray-700 transition"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Welcome back, {user?.username} 👋
        </h2>
      </div>

      {/* Right — Notifications + User */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
          <Bell size={18} />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e94560] rounded-full" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#e94560] flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.username}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>

              {/* Menu Items */}
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <User size={15} />
                Profile
              </Link>

              <Link
                href="/subscription"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Settings size={15} />
                Subscription
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}