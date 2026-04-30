'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Clock, Building2, LogOut, ChevronLeft, ChevronRight, Menu, X, Zap, CreditCard } from 'lucide-react';
const navItems = [
  { href: '/admin',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/pending',     label: 'Pending Users', icon: Clock },
  { href: '/admin/users',       label: 'All Users',    icon: Users },
  { href: '/admin/organizers',  label: 'Organizers',   icon: Building2 },
  { href: '/admin/payments',    label: 'Payments',     icon: CreditCard },  // ← ye add karo
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
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1a2e] text-white p-2.5 rounded-xl shadow-lg"
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
          bg-[#1a1a2e] text-white
          transition-all duration-300 ease-in-out
          shadow-2xl
          ${isCollapsed ? 'w-[70px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-white/10 min-h-[73px]`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center shadow-lg shadow-red-900/40">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-widest">PLANNEXA</h1>
                <p className="text-slate-400 text-[10px] mt-0.5">Admin Panel</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c7354e] flex items-center justify-center shadow-lg shadow-red-900/40">
              <Zap size={18} className="text-white fill-white" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-4 space-y-1 overflow-y-auto`}>
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
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                    ${isCollapsed ? 'justify-center px-2' : ''}
                    ${isActive
                      ? 'bg-[#e94560] text-white shadow-lg shadow-red-900/20'
                      : 'text-slate-300 hover:bg-white/10'
                    }
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-white/10`}>
          <div
            onMouseEnter={(e) => handleMouseEnter('Logout', e)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm 
                text-slate-300 hover:bg-white/10 w-full transition-all duration-200
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
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
          {/* Tooltip arrow */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-t border-white/10 rotate-45"
            style={{ marginLeft: '-4px' }}
          />
        </div>
      )}

      {/* Main Content - Dynamic margin based on sidebar state */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:ml-[70px]' : 'md:ml-64'}
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