'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import WorkspaceHeader from './WorkspaceHeader';
import { Icon } from '@/components/ui/Icon';

export default function AppShell({ children, user }: { children: React.ReactNode, user: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = user?.role || 'MEMBER';
  const isExternalPro = userRole === 'EXTERNAL_PROFESSIONAL';

  const bottomNavItems = isExternalPro ? [
    { href: '/today', icon: 'Clock', label: 'Today', exact: true },
    { href: '/leads', icon: 'Users', label: 'Assigned' },
    { href: '/rep', icon: 'Briefcase', label: 'Logs' },
    { href: '/settings', icon: 'Settings', label: 'Settings' },
  ] : [
    { href: '/today', icon: 'Clock', label: 'Today', exact: true },
    { href: '/leads', icon: 'Users', label: 'Enquiries' },
    { href: '/sales-support', icon: 'HeartHandshake', label: 'Support' },
    { href: '/team', icon: 'UserCheck', label: 'Team' },
    { href: '/billing', icon: 'CreditCard', label: 'Billing' },
  ];

  return (
    <div className="flex h-screen bg-canvas font-sans text-on-surface antialiased overflow-hidden relative">
      <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col relative w-full h-full bg-transparent overflow-hidden z-10 md:ml-[72px] lg:ml-[248px] transition-all duration-200 ease-out">
        <WorkspaceHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} isMobile={isMobile} />
        
        <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-6">
          <div className="max-w-[1600px] mx-auto w-full p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Visible only on mobile devices < 768px) */}
        <nav 
          aria-label="Mobile Navigation Bar"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/40 px-2 py-1.5 flex items-center justify-around shadow-2xl pb-safe"
        >
          {bottomNavItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-primary/15 scale-110' : ''}`}>
                  <Icon name={item.icon} size={20} className={isActive ? 'text-primary' : 'text-on-surface-variant'} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
