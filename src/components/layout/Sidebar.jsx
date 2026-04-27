'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Ticket, BookOpen,
  CreditCard, Crown, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    label: 'Tickets',
    href: '/tickets',
    icon: Ticket,
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: BookOpen,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Subscription',
    href: '/subscription',
    icon: Crown,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#1a1a2e] z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold text-white tracking-widest">PLANNEXA</h1>
            <p className="text-xs text-slate-400 mt-0.5">Event Platform</p>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 mx-4 mt-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#e94560] flex items-center justify-center text-white font-bold text-sm">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.username}</p>
                <p className="text-slate-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="p-4 mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-[#e94560] text-white shadow-lg shadow-red-900/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Plan Badge — Bottom */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-[#e94560] to-[#c23152] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-white text-xs font-semibold">Upgrade Plan</span>
            </div>
            <p className="text-white/70 text-xs mb-3">
              More events, tickets & features unlock karo
            </p>
            <Link
              href="/subscription"
              className="block text-center bg-white text-[#e94560] text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition"
            >
              View Plans
            </Link>
          </div>
        </div>

      </aside>
    </>
  );
}