'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Icon } from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import ProductSwitcher, { getActiveProduct } from '@/components/ui/ProductSwitcher';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Plus,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface WorkspaceHeaderProps {
  user: any;
  onMenuClick: () => void;
  isMobile: boolean;
}

export default function WorkspaceHeader({
  user,
  onMenuClick,
  isMobile,
}: WorkspaceHeaderProps) {
  const pathname = usePathname() || '';
  const activeProduct = getActiveProduct(pathname);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const orgName = user?.organization?.name || 'Workspace';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 flex-shrink-0 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-30 sticky top-0">
      {/* Left Column: Menu Button + Product Switcher + Workspace Pill */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {isMobile && (
          <button
            type="button"
            onClick={onMenuClick}
            className="w-9 h-9 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Icon name="Menu" size={18} />
          </button>
        )}

        {/* 1-Click Product Switcher */}
        <div className="shrink-0">
          <ProductSwitcher />
        </div>

        {/* Workspace Context Badge (Hidden on very narrow mobile screens) */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-container-high/40 border border-outline-variant/30">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed shrink-0 animate-pulse" />
          <span className="text-xs font-semibold text-on-surface truncate max-w-[160px]">
            {orgName}
          </span>
        </div>
      </div>

      {/* Right Column: Context Action + Notifications + User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/recovery"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C7F36B]/10 hover:bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/30 text-xs font-bold transition-all shadow-sm select-none"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Recover Leads</span>
        </Link>

        <Link
          href="/leads?action=new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] text-xs font-extrabold transition-all shadow-sm shadow-[#C7F36B]/20 select-none active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Enquiry</span>
        </Link>

        {activeProduct === 'dss' && (
          <Link
            href="/dss/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#248277]/20 hover:bg-[#248277]/30 text-[#45bfae] border border-[#248277]/40 text-xs font-bold transition-all select-none"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Learning</span>
          </Link>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          className="relative w-9 h-9 rounded-xl border border-outline-variant/30 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* User Profile Popover */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-container-high transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-fixed font-bold text-xs">
              {userInitial}
            </div>
            <ChevronDown className="w-3 h-3 text-on-surface-variant hidden sm:block" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            >
              {/* Account summary header */}
              <div className="px-3 py-2.5 border-b border-outline-variant/20 mb-1">
                <div className="text-xs font-bold text-on-surface truncate">
                  {user?.name || 'User Account'}
                </div>
                <div className="text-[11px] text-on-surface-variant truncate">
                  {user?.email || 'Logged in'}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge variant="primary" size="sm">
                    {user?.role || 'MEMBER'}
                  </Badge>
                  {user?.organization?.plan && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                      {user.organization.plan}
                    </span>
                  )}
                </div>
              </div>

              {/* Account links */}
              <div className="space-y-0.5 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 text-on-surface-variant" />
                  <span>Workspace Settings</span>
                </Link>

                <Link
                  href="/billing"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  role="menuitem"
                >
                  <Icon name="CreditCard" size={16} className="text-on-surface-variant" />
                  <span>Billing & Subscription</span>
                </Link>

                <div className="my-1 border-t border-outline-variant/20" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-error hover:bg-error-container/20 transition-colors text-left"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
