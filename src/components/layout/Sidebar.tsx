'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export default function Sidebar({ user, isOpen, setIsOpen, isMobile }: { user: any, isOpen: boolean, setIsOpen: (v: boolean) => void, isMobile: boolean }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('closecraft_sidebar_expanded');
      if (stored !== null) setIsExpanded(stored === 'true');
    }
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      localStorage.setItem('closecraft_sidebar_expanded', String(next));
      return next;
    });
  };

  const navItems = [
    { href: '/', icon: 'Home', label: 'Back to Home', exact: true },
    { href: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', exact: true },
    { href: '/rep', icon: 'Target', label: (user?.role === 'CLOSER' || user?.role === 'SETTER') ? 'My Sales Hub' : 'Closer & Setter Hub' },
    { href: '/team', icon: 'UserCheck', label: user?.role === 'MANAGER' ? 'Team Management' : 'Team & Closers' },
    { href: '/leads', icon: 'Users', label: 'Leads' },
    { href: '/inbox', icon: 'Inbox', label: 'Inbox' },
    { href: '/pipeline', icon: 'KanbanSquare', label: 'Pipeline' },
    { href: '/appointments', icon: 'Calendar', label: 'Appointments' },
    { href: '/dashboard/revenue-engine', icon: 'Zap', label: 'Revenue Engine' },
    { href: '/dashboard/analytics', icon: 'BarChart2', label: 'Analytics' },
    { href: '/automations', icon: 'Bot', label: 'Automations' },
    { href: '/settings', icon: 'Settings', label: 'Settings' },
    { href: '/admin', icon: 'Shield', label: 'Platform Admin' },
    { href: '/dss', icon: 'GraduationCap', label: 'DSS Academy' }
  ];

  const userRole = user?.role || 'MEMBER';
  const visibleNavItems = navItems.filter(item => {
    if (userRole === 'CLOSER' || userRole === 'SETTER') {
      return ['/', '/rep', '/leads', '/inbox', '/pipeline', '/appointments', '/dss'].includes(item.href);
    }
    if (userRole === 'MANAGER') {
      return ['/', '/team', '/rep', '/leads', '/inbox', '/pipeline', '/appointments', '/dashboard/analytics', '/automations', '/dss'].includes(item.href);
    }
    // ADMIN / SUPER_ADMIN sees all
    return true;
  });

  const sidebarClasses = `
    fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between select-none shadow-sm
    transition-[width,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]
    ${isMobile ? (isOpen ? 'translate-x-0 w-[min(320px,calc(100vw-32px))]' : '-translate-x-full w-[min(320px,calc(100vw-32px))]') : (isExpanded ? 'w-[248px]' : 'w-[72px] translate-x-0')}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30">
          <Link href="/" className="flex items-center gap-3 overflow-hidden whitespace-nowrap group hover:opacity-80 transition-opacity" title="Back to CloseCraft Home">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
               <Icon name="Rocket" size={16} className="text-primary" />
            </div>
            {(isExpanded || isMobile) && (
              <span className="font-heading text-lg font-semibold text-on-surface tracking-tight transition-opacity duration-120">Closecraft</span>
            )}
          </Link>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="p-1 text-on-surface-variant shrink-0 hover:text-on-surface">
              <Icon name="X" size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                title={(!isExpanded && !isMobile) ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative overflow-hidden ${isActive ? 'bg-primary-container text-primary-fixed' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
              >
                <Icon name={item.icon} size={20} className={`shrink-0 ${isActive ? 'text-primary-fixed' : 'text-on-surface-variant group-hover:text-on-surface'}`} />
                <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-120 ${(!isExpanded && !isMobile) ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-3 border-t border-outline-variant/30 flex items-center justify-between">
        <a
          href="https://wa.me/2349026365853?text=Hello%20CloseCraft%2C%20I%20need%20support%20with%20my%20pilot%20workspace."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-emerald-400 transition-colors p-1.5 rounded-md hover:bg-surface-container-high"
          title="WhatsApp Support: +234 902 636 5853"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className={`font-medium transition-opacity duration-120 ${(!isExpanded && !isMobile) ? 'hidden' : 'inline'}`}>WhatsApp Support</span>
        </a>
        {!isMobile && (
          <button onClick={toggleExpanded} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors shrink-0" title="Toggle Sidebar">
            <Icon name={isExpanded ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}
