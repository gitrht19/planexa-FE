'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Crown
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import OrganizerService from '@/services/organizer.service';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user }  = useAuth();

  const [isCollapsed,     setIsCollapsed]     = useState(false);
  const [hoveredItem,     setHoveredItem]     = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
  const [navItems,        setNavItems]        = useState([]);
  const [navLoading,      setNavLoading]      = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsCollapsed(JSON.parse(saved));
  }, []);

  // ✅ Sirf API se — no fallback
  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      try {
        setNavLoading(true);
        const data = await OrganizerService.getSidebarModules();
        const list = Array.isArray(data) ? data : (data?.data ?? []);

        const mapped = list
          .filter(m => m.is_enabled && m.module_detail?.is_active)
          .map(m => ({
            label:    m.module_detail.name,
            href:     m.module_detail.path.startsWith('/')
                        ? m.module_detail.path
                        : `/${m.module_detail.path}`,
            iconName: m.module_detail.icon,
            order:    m.module_detail.order,
            children: m.module_detail.children ?? [],
          }))
          .sort((a, b) => a.order - b.order);

        setNavItems(mapped);
      } catch (err) {
        console.error('Sidebar modules fetch failed:', err);
        setNavItems([]);  // ✅ error pe bhi empty — no hardcoded fallback
      } finally {
        setNavLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
  };

  const handleMouseEnter = (label, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ top: rect.top + rect.height / 2 });
    setHoveredItem(label);
  };

  const handleMouseLeave = () => setHoveredItem(null);

  const getIcon = (iconName) => {
    if (!iconName) return Icons['Circle'];
    return Icons[iconName] || Icons['Circle'];
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-[#0f0f1a] border-r border-white/[0.06]
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'w-[70px]' : 'w-[220px]'}
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent" />

        {/* Logo / Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-4 border-b border-white/[0.06] min-h-[73px]`}>
          {!isCollapsed ? (
            <div>
              <p className="text-white text-sm font-bold tracking-[0.12em]">PLANNEXA</p>
              <p className="text-[10px] text-slate-500 tracking-wide -mt-0.5">Event Platform</p>
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-7 h-7 items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition"
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

        {/* Nav Label */}
        {!isCollapsed && (
          <p className="px-5 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-600 uppercase">
            Menu
          </p>
        )}

        {/* Nav Items */}
        <nav className={`${isCollapsed ? 'px-2' : 'px-3'} space-y-0.5 flex-1 overflow-y-auto`}>
          {navLoading ? (
            // Skeleton
            <div className="space-y-1 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>

          ) : navItems.length === 0 ? (
            // ✅ Koi module assign nahi — clean empty state
            !isCollapsed && (
              <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                  <Icons.LayoutGrid size={18} className="text-slate-600" />
                </div>
                <p className="text-slate-600 text-[11px] font-medium">No modules assigned</p>
                <p className="text-slate-700 text-[10px] mt-1 leading-relaxed">
                  Contact admin to enable modules
                </p>
              </div>
            )

          ) : (
            navItems.map((item) => {
              const Icon     = getIcon(item.iconName);
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <div key={item.href} className="relative">
                  <div
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
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#e94560] rounded-r-full shadow-[0_0_8px_#e94560]" />
                      )}

                      <span className={`flex-shrink-0 transition-colors duration-200
                        ${isActive ? 'text-[#e94560]' : 'text-slate-600 group-hover:text-slate-300'}`}>
                        <Icon size={16} />
                      </span>

                      {!isCollapsed && (
                        <span className="text-[13px] font-medium">{item.label}</span>
                      )}

                      {isActive && isCollapsed && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#e94560] shadow-[0_0_6px_#e94560]" />
                      )}
                    </Link>
                  </div>

                  {/* Children */}
                  {!isCollapsed && item.children?.length > 0 && (
                    <div className="ml-4 pl-3 border-l border-white/[0.06] mt-0.5 space-y-0.5">
                      {item.children.map(child => {
                        const ChildIcon   = getIcon(child.icon);
                        const childActive = pathname === child.path;
                        return (
                          <Link
                            key={child.id}
                            href={child.path}
                            onClick={onClose}
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium
                              transition-all duration-200 group
                              ${childActive
                                ? 'bg-[#e94560]/10 text-white'
                                : 'text-slate-600 hover:text-slate-200 hover:bg-white/[0.05]'
                              }
                            `}
                          >
                            <ChildIcon size={13} className={childActive ? 'text-[#e94560]' : 'text-slate-600 group-hover:text-slate-300'} />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
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
                <Link href="/subscription" onClick={onClose}
                  className="block text-center bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200">
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
            <Link href="/subscription" onClick={onClose}>
              <div className="relative rounded-xl bg-gradient-to-br from-[#e94560] to-[#8b1a30] p-2 shadow-lg shadow-red-900/30 flex justify-center cursor-pointer">
                <Crown size={16} className="text-yellow-300" />
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* Tooltip */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed z-[100] px-3 py-1.5 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl whitespace-nowrap"
          style={{ left: '70px', top: `${tooltipPosition.top}px`, transform: 'translateY(-50%)', marginLeft: '8px' }}
        >
          <span className="text-xs text-white font-medium">{hoveredItem}</span>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-t border-white/10 rotate-45" style={{ marginLeft: '-4px' }} />
        </div>
      )}
    </>
  );
}