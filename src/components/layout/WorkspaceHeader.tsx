'use client';
import React from 'react';
import { Icon } from '@/components/ui/Icon';

export default function WorkspaceHeader({ user, onMenuClick, isMobile }: { user: any, onMenuClick: () => void, isMobile: boolean }) {
  return (
    <header className="h-16 flex-shrink-0 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 text-on-surface hover:bg-surface-container-high rounded-md transition-colors">
            <Icon name="Menu" size={20} />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-on-surface">{user?.organization?.name || 'Workspace'}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
          <Icon name="Bell" size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm border border-primary/30">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}
