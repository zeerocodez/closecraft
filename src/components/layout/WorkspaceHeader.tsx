'use client';
import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function WorkspaceHeader({ user, onMenuClick, isMobile }: { user: any, onMenuClick: () => void, isMobile: boolean }) {
  return (
    <header className="h-16 flex-shrink-0 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 text-on-surface hover:bg-surface-container-high rounded-md transition-colors" aria-label="Open menu">
            <Icon name="Menu" size={20} />
          </button>
        )}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold uppercase tracking-wider transition-all border border-outline-variant/40"
            title="Return to CloseCraft Home"
          >
            <Icon name="ArrowLeft" size={14} />
            <Icon name="Home" size={14} />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-on-surface leading-tight">{user?.organization?.name || 'Workspace'}</h1>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/dss" 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#248277]/15 hover:bg-[#248277]/25 text-[#45bfae] text-xs font-bold transition-all border border-[#248277]/30"
          title="Digital Sales School Academy"
        >
          <Icon name="GraduationCap" size={15} />
          <span className="hidden sm:inline">DSS Academy</span>
        </Link>
        <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors" title="Notifications">
          <Icon name="Bell" size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm border border-primary/30">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}
