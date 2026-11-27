'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import WorkspaceHeader from './WorkspaceHeader';
import { Icon } from '@/components/ui/Icon';
import { getActiveProduct } from '@/components/ui/ProductSwitcher';

export interface AppShellProps {
  children: React.ReactNode;
  user: any;
}

export default function AppShell({ children, user }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname() || '';
  const activeProduct = getActiveProduct(pathname);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = user?.role || 'MEMBER';
  const isExternalPro = userRole === 'EXTERNAL_PROFESSIONAL';

  // Product-Aware Mobile Bottom Navigation
  const getBottomNavItems = () => {
    if (isExternalPro) {
      return [
        { href: '/rep/growth', icon: 'Briefcase', label: 'Hub', exact: true },
        { href: '/growth/projects', icon: 'Layers', label: 'Projects' },
        { href: '/dss/roleplay', icon: 'PlayCircle', label: 'Roleplay' },
        { href: '/settings', icon: 'Settings', label: 'Settings' },
      ];
    }

    if (activeProduct === 'dss') {
      return [
        { href: '/dss/dashboard', icon: 'GraduationCap', label: 'Learning', exact: true },
        { href: '/dss/courses', icon: 'BookOpen', label: 'Courses' },
        { href: '/dss/roleplay', icon: 'PlayCircle', label: 'Roleplay' },
        { href: '/dss/certificates', icon: 'ShieldCheck', label: 'Certs' },
      ];
    }

    // CloseCraft Revenue Operating System: RECOVER • CONVERT • DELIVER
    return [
      { href: '/dashboard', icon: 'TrendingUp', label: 'Command', exact: true },
      { href: '/recovery', icon: 'Sparkles', label: 'Recover' },
      { href: '/inbox', icon: 'Inbox', label: 'Inbox' },
      { href: '/pipeline', icon: 'Layers', label: 'Pipeline' },
      { href: '/commitments', icon: 'CheckSquare', label: 'Deliver' },
    ];
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <div className="flex h-screen bg-canvas font-sans text-on-surface antialiased overflow-hidden relative">
      {/* Ambient brand glow behind the app chrome */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/3 h-96 w-[42rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-[30rem] rounded-full bg-teal-500/[0.05] blur-3xl" />
      </div>
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <div className="flex-1 flex flex-col relative w-full h-full bg-transparent overflow-hidden z-10 md:ml-[72px] lg:ml-[248px] transition-all duration-200 ease-out">
        <WorkspaceHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Visible only on mobile devices < 768px) */}
        <nav
          aria-label="Mobile Navigation Bar"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 px-2 py-1.5 flex items-center justify-around shadow-2xl pb-safe"
        >
          {bottomNavItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] min-h-[48px] select-none ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-primary/15 scale-110' : ''
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    className={isActive ? 'text-primary-fixed' : 'text-on-surface-variant'}
                  />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
