// In your Sidebar component, add this effect to notify about collapse state

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Ticket, BookOpen,
  CreditCard, Crown, X, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Events',    href: '/events',    icon: Calendar },
  { label: 'Tickets',   href: '/tickets',   icon: Ticket },
  { label: 'Bookings',  href: '/bookings',  icon: BookOpen },
  { label: 'Payments',  href: '/payments',  icon: CreditCard },
  { label: 'Subscription', href: '/subscription', icon: Crown },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch custom event to notify layout
    window.dispatchEvent(new Event('storage'));
  };

  const handleMouseEnter = (label, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top + rect.height / 2
    });
    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={`
          fixed top-0 left-0 h-full z-30
          flex flex-col
          bg-[#0f0f1a]
          border-r border-white/[0.06]
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'w-[70px]' : 'w-[220px]'}
        `}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent" />

        {/* Logo / Toggle Section */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-4 border-b border-white/[0.06] min-h-[73px]`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#e94560] flex items-center justify-center shadow-lg shadow-red-900/40">
                <Zap size={13} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold tracking-[0.12em]">PLANNEXA</p>
                <p className="text-[10px] text-slate-500 tracking-wide -mt-0.5">Event Platform</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e94560] to-[#c7354e] flex items-center justify-center shadow-lg shadow-red-900/40">
              <Zap size={16} className="text-white fill-white" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="md:hidden w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className={`mx-2 mt-3 mb-1 px-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e94560] to-[#a12040] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f0f1a]" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.username}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav Label */}
        {!isCollapsed && (
          <p className="px-5 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-600 uppercase">
            Menu
          </p>
        )}

        {/* Nav Items */}
        <nav className={`${isCollapsed ? 'px-2' : 'px-3'} space-y-0.5 flex-1 overflow-y-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={(e) => isCollapsed && handleMouseEnter(item.label, e)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-[#e94560]/15 text-white'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#e94560] rounded-r-full shadow-[0_0_8px_#e94560]" />
                  )}

                  <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-[#e94560]' : 'text-slate-600 group-hover:text-slate-300'}`}>
                    <Icon size={16} />
                  </span>

                  {!isCollapsed && (
                    <span className="text-[13px] font-medium">{item.label}</span>
                  )}

                  {/* Active dot for collapsed mode */}
                  {isActive && isCollapsed && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#e94560] shadow-[0_0_6px_#e94560]" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        {!isCollapsed ? (
          <div className="mx-3 mb-4 mt-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#e94560] to-[#8b1a30] p-3.5 shadow-lg shadow-red-900/30">
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-black/20" />

              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <Crown size={13} className="text-yellow-300" />
                  <span className="text-white text-[11px] font-bold tracking-wide">Go Premium</span>
                </div>
                <p className="text-white/60 text-[10px] leading-relaxed mb-2.5">
                  Unlock unlimited events & features
                </p>
                <Link
                  href="/subscription"
                  onClick={onClose}
                  className="block text-center bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200"
                >
                  View Plans →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="mx-2 mb-4 mt-3"
            onMouseEnter={(e) => handleMouseEnter('Upgrade to Premium', e)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative rounded-xl bg-gradient-to-br from-[#e94560] to-[#8b1a30] p-2 shadow-lg shadow-red-900/30 flex justify-center cursor-pointer">
              <Crown size={16} className="text-yellow-300" />
            </div>
          </div>
        )}
      </aside>

      {/* Tooltip Portal */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[100] px-3 py-1.5 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in duration-200"
          style={{
            left: '70px',
            top: `${tooltipPosition.top}px`,
            transform: 'translateY(-50%)',
            marginLeft: '8px'
          }}
        >
          <span className="text-xs text-white font-medium">{hoveredItem}</span>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-t border-white/10 rotate-45"
            style={{ marginLeft: '-4px' }}
          />
        </div>
      )}
    </>
  );
}