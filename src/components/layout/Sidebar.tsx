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
    { href: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', exact: true },
    { href: '/dashboard/revenue-engine', icon: 'Zap', label: 'Revenue Engine' },
    { href: '/dashboard/analytics', icon: 'BarChart2', label: 'Analytics' },
    { href: '/leads', icon: 'Users', label: 'Leads' },
    { href: '/inbox', icon: 'Inbox', label: 'Inbox' },
    { href: '/pipeline', icon: 'KanbanSquare', label: 'Pipeline' },
    { href: '/appointments', icon: 'Calendar', label: 'Appointments' },
    { href: '/automations', icon: 'Bot', label: 'Automations' },
    { href: '/settings', icon: 'Settings', label: 'Settings' }
  ];

  const sidebarClasses = `
    fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between select-none shadow-sm
    transition-[width,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]
    ${isMobile ? (isOpen ? 'translate-x-0 w-[min(320px,calc(100vw-32px))]' : '-translate-x-full w-[min(320px,calc(100vw-32px))]') : (isExpanded ? 'w-[248px]' : 'w-[72px] translate-x-0')}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
               <Icon name="Rocket" size={16} className="text-primary" />
            </div>
            {(isExpanded || isMobile) && (
              <span className="font-heading text-lg font-semibold text-on-surface tracking-tight transition-opacity duration-120">Closecraft</span>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="p-1 text-on-surface-variant shrink-0 hover:text-on-surface">
              <Icon name="X" size={20} />
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
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
      
      {!isMobile && (
        <div className="p-3 border-t border-outline-variant/30 flex justify-end">
          <button onClick={toggleExpanded} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors" title="Toggle Sidebar">
            <Icon name={isExpanded ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
          </button>
        </div>
      )}
    </aside>
  );
}
