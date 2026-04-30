'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, Bell, LogOut, User, Settings, ChevronDown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Outside click close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
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

  const hasUnreadNotifications = notifications.length > 0;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Welcome back, {user?.username} 👋
                </p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {user?.role} • Last login today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-gray-600"
            >
              <Bell size={18} />
              {hasUnreadNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  <p className="text-[10px] text-gray-400">You have {notifications.length} unread notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                    </div>
                  ) : (
                    notifications.map((notification, idx) => (
                      <div key={idx} className="p-3 hover:bg-gray-50 transition border-b border-gray-50">
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition group"
            >
              {/* Avatar with status */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
              </div>
              
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-medium rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition group"
                  >
                    <User size={15} className="group-hover:scale-110 transition" />
                    Profile Settings
                  </Link>

                  <Link
                    href="/subscription"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition group"
                  >
                    <Settings size={15} className="group-hover:scale-110 transition" />
                    Subscription
                  </Link>
                </div>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition group"
                  >
                    <LogOut size={15} className="group-hover:scale-110 transition" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}