'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/leads', icon: 'group', label: 'Leads' },
    { href: '/inbox', icon: 'inbox', label: 'Inbox', badge: '5' },
    { href: '/pipeline', icon: 'view_kanban', label: 'Pipeline' },
    { href: '/appointments', icon: 'calendar_today', label: 'Appointments' },
    { href: '/settings', icon: 'settings', label: 'Settings' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest/70 backdrop-blur-2xl z-50 flex flex-col justify-between select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)] border-r border-surface-container/50 transition-all duration-300">
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container/30">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-primary-fixed/30">
              <span className="material-symbols-outlined text-on-primary text-[20px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Closecraft</span>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-primary-fixed tracking-wider font-bold">Premium OS</span>
            </div>
          </div>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
        </div>
        
        <div className="px-space-md py-space-md">
          <div className="bg-surface-container-low/50 border border-surface-container/50 hover:bg-surface-container/50 transition-all rounded-xl p-3 flex items-center justify-between text-on-surface cursor-pointer group shadow-sm hover:shadow-md">
            <div className="flex items-center gap-space-xs overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed text-[14px]">corporate_fare</span>
              </div>
              <span className="font-label-md text-sm truncate font-semibold text-on-surface group-hover:text-primary-fixed transition-colors">Acme Global</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px] group-hover:text-primary transition-colors">unfold_more</span>
          </div>
        </div>
        
        <nav className="flex-1 px-space-md py-space-xs space-y-space-md">
          <div className="space-y-2">
            <div className="px-2 py-1 font-label-caps text-[10px] uppercase text-outline-variant tracking-widest font-bold flex items-center gap-2">
              <span>Main Menu</span>
              <div className="h-[1px] flex-1 bg-surface-container/50"></div>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden relative ${isActive ? 'bg-primary/10 border border-primary/20 text-primary-fixed' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent'}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-tertiary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                      <span className={`font-label-md text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full font-label-caps text-[10px] font-bold ${isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary-fixed'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
      
      <div className="p-space-md space-y-3 bg-surface-container-lowest/50 border-t border-surface-container/30 backdrop-blur-xl">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-surface-container-low to-surface-container border border-surface-container-highest/30 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-container to-surface-container-highest flex items-center justify-center border border-outline-variant/30 overflow-hidden">
                <span className="material-symbols-outlined text-on-surface text-[20px]">account_circle</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-surface-container-lowest shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-sm text-on-surface font-bold truncate leading-tight">{user?.name || 'Executive'}</span>
              <span className="font-body-sm text-[11px] text-primary-fixed truncate leading-tight flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                Pro Member
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[18px] hover:text-primary cursor-pointer transition-colors">settings</span>
        </div>
      </div>
    </aside>
  );
}
