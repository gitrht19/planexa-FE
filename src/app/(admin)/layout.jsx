'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Clock, Building2, LogOut, 
  ChevronLeft, ChevronRight, Menu, X, CreditCard,
  Shield, Sparkles
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pending', label: 'Pending Users', icon: Clock },
  { href: '/admin/users', label: 'All Users', icon: Users },
  { href: '/admin/organizers', label: 'Organizers', icon: Building2 },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
  const itemRefs = useRef({});

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white p-2.5 rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          flex flex-col
          bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]
          text-white
          transition-all duration-300 ease-in-out
          shadow-2xl
          ${isCollapsed ? 'w-[80px]' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo Section - Collapsed mein sirf blank space */}
        <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-5 border-b border-white/10 min-h-[85px]`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              {/* <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl blur-md opacity-70" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
              </div> */}
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Plannexa
                </h1>
                <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Admin Portal</p>
              </div>
            </div>
          ) : (
            // Collapsed mode - Empty space (no icon)
            <div className="w-10 h-10"></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-3' : 'px-4'} py-6 space-y-1.5 overflow-y-auto relative z-10`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <div
                key={href}
                ref={el => itemRefs.current[label] = el}
                className="relative"
                onMouseEnter={(e) => handleMouseEnter(label, e)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isCollapsed ? 'justify-center px-2' : ''}
                    ${isActive
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-white shadow-lg shadow-rose-500/10 border border-white/10'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-rose-500 to-amber-500 rounded-r-full" />
                  )}
                  
                  <Icon size={20} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-rose-400' : ''}`} />
                  
                  {!isCollapsed && (
                    <span className={`${isActive ? 'font-semibold' : ''}`}>
                      {label}
                    </span>
                  )}

                  {/* Active Indicator for collapsed mode */}
                  {isActive && isCollapsed && (
                    <div className="absolute right-0 w-1 h-8 bg-gradient-to-b from-rose-500 to-amber-500 rounded-l-full" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout Section */}
        <div className={`relative ${isCollapsed ? 'px-3' : 'px-4'} py-4 border-t border-white/10`}>
          {/* User Info (only when expanded) */}
          {!isCollapsed && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Shield size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Admin User</p>
                  <p className="text-[10px] text-slate-400 truncate">administrator@plannexa.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div
            onMouseEnter={(e) => handleMouseEnter('Logout', e)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                text-slate-300 hover:bg-white/10 hover:text-white w-full transition-all duration-200
                ${isCollapsed ? 'justify-center px-2' : ''}
                group
              `}
            >
              <LogOut size={20} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>

          {/* Version Info (only when expanded) */}
          {!isCollapsed && (
            <p className="text-[10px] text-slate-500 text-center mt-4">
              Version 2.0.0 | © 2024 Plannexa
            </p>
          )}
        </div>
      </aside>

      {/* Tooltip Portal */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[100] px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in duration-200"
          style={{
            left: '88px',
            top: `${tooltipPosition.top}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <span className="text-xs text-white font-medium">{hoveredItem}</span>
          {/* Tooltip arrow */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"
            style={{ marginLeft: '-5px' }}
          />
        </div>
      )}

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-72'}
          ml-0
          min-h-screen
        `}
      >
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}