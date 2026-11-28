'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import Logo from '@/components/ui/Logo';
import { getActiveProduct, ProductKey } from '@/components/ui/ProductSwitcher';
import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
} from 'lucide-react';

export interface SidebarProps {
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

export default function Sidebar({ user, isOpen, setIsOpen, isMobile }: SidebarProps) {
  const pathname = usePathname() || '';
  const activeProduct = getActiveProduct(pathname);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('closecraft_sidebar_expanded');
      if (stored !== null) setIsExpanded(stored === 'true');
    }
  }, []);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('closecraft_sidebar_expanded', String(next));
      return next;
    });
  };

  const userRole = user?.role || 'MEMBER';
  const isOperator =
    user?.role === 'OPERATOR' || user?.role === 'SUPER_ADMIN' || user?.isOperator;
  const isManagerOrOwner =
    userRole === 'OWNER' ||
    userRole === 'ADMIN' ||
    userRole === 'MANAGER' ||
    userRole === 'SUPER_ADMIN';

  // Live sidebar counts (unread inbox messages, follow-ups due), from the
  // session-scoped /api/nav-counts route. Failures stay silent — a missing
  // badge must never block navigation.
  const [navCounts, setNavCounts] = useState<{ newEnquiries: number; followUpsDue: number; unreadMessages: number } | null>(null);

  useEffect(() => {
    if (userRole === 'EXTERNAL_PROFESSIONAL') return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/nav-counts');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data?.newEnquiries === 'number' && typeof data?.followUpsDue === 'number' && typeof data?.unreadMessages === 'number') {
          setNavCounts({ newEnquiries: data.newEnquiries, followUpsDue: data.followUpsDue, unreadMessages: data.unreadMessages });
        }
      } catch {
        // Badges are an aid, not a blocker.
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pathname, userRole]);

  const sidebarClasses = `
    fixed left-0 top-0 h-full bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-[#070B14] border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none shadow-sm
    transition-[width,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]
    ${
      isMobile
        ? isOpen
          ? 'translate-x-0 w-[min(300px,calc(100vw-32px))]'
          : '-translate-x-full w-[min(300px,calc(100vw-32px))]'
        : isExpanded
        ? 'w-[248px]'
        : 'w-[72px] translate-x-0'
    }
  `;

  // 1. External Professional Restricted Working View
  if (userRole === 'EXTERNAL_PROFESSIONAL') {
    const proNavItems = [
      { href: '/rep/growth', icon: 'Briefcase', label: 'Growth Hub', exact: true },
      { href: '/growth/projects', icon: 'Layers', label: 'Assigned Projects' },
      { href: '/leads', icon: 'Users', label: 'Assigned Enquiries' },
      { href: '/dss/roleplay', icon: 'PlayCircle', label: 'Skills & Roleplay' },
      { href: '/settings', icon: 'Settings', label: 'Settings' },
    ];

    return (
      <aside className={sidebarClasses}>
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
          <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30">
            <Link
              href="/rep/growth"
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap group hover:opacity-85 transition-opacity py-1"
            >
              <Logo variant={isExpanded || isMobile ? 'full' : 'icon'} size="sm" alt="Closecraft Partner" />
              {(isExpanded || isMobile) && (
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shrink-0">
                  PARTNER
                </span>
              )}
            </Link>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {proNavItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  title={!isExpanded && !isMobile ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group relative overflow-hidden ${
                    isActive
                      ? 'bg-primary/15 text-primary-fixed font-bold border border-primary/30 shadow-sm shadow-primary/10'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary" aria-hidden="true" />
                  )}
                  <Icon
                    name={item.icon}
                    size={20}
                    className={`shrink-0 ${
                      isActive ? 'text-primary-fixed' : 'text-on-surface-variant group-hover:text-on-surface'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold whitespace-nowrap transition-opacity duration-150 ${
                      !isExpanded && !isMobile ? 'opacity-0 w-0' : 'opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-outline-variant/30 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">Partner View</span>
          {!isMobile && (
            <button
              onClick={toggleExpanded}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors shrink-0"
              title="Toggle sidebar"
            >
              {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          )}
        </div>
      </aside>
    );
  }

  // 2. Streamlined Global Navigation Sections
  interface NavItem {
    href: string;
    icon: string;
    label: string;
    badge?: string;
    countKey?: 'newEnquiries' | 'followUpsDue' | 'unreadMessages';
    exact?: boolean;
    visible?: boolean;
  }

  const getProductNav = (): { title: string; items: NavItem[] }[] => {
    if (activeProduct === 'dss') {
      return [
        {
          title: 'LEARNING',
          items: [
            { href: '/dss/dashboard', icon: 'GraduationCap', label: 'My Learning', exact: true },
            { href: '/dss/courses', icon: 'BookOpen', label: 'Courses & Syllabus' },
            { href: '/dss/assignments', icon: 'FileText', label: 'Assignments' },
            { href: '/dss/examinations', icon: 'Award', label: 'Examinations' },
            { href: '/dss/roleplay', icon: 'PlayCircle', label: 'AI Roleplay' },
            { href: '/dss/certificates', icon: 'ShieldCheck', label: 'Certificates' },
            { href: '/dashboard', icon: 'ArrowLeft', label: 'Back to CloseCraft' },
          ],
        },
      ];
    }

    // Master CloseCraft navigation, organised around the daily job of a
    // business that runs ads: enquiries come in, get followed up, and get
    // closed. Labels use the customer's words, not internal product names,
    // and every href is unchanged so no link, guide step or bookmark breaks.
    return [
      {
        title: 'OVERVIEW',
        items: [
          { href: '/dashboard', icon: 'TrendingUp', label: 'Overview', exact: true },
        ],
      },
      {
        title: 'ENQUIRIES',
        items: [
          { href: '/inbox', icon: 'Inbox', label: 'Inbox', countKey: 'unreadMessages' },
          { href: '/leads', icon: 'Users', label: 'Enquiries' },
          { href: '/today', icon: 'Clock', label: 'Follow-ups', countKey: 'followUpsDue' },
          { href: '/pipeline', icon: 'Layers', label: 'Sales Pipeline' },
          { href: '/recovery', icon: 'Sparkles', label: 'Lead Recovery' },
        ],
      },
      {
        title: 'INSIGHTS',
        items: [
          { href: '/dashboard/analytics', icon: 'Activity', label: 'Revenue Analytics' },
          { href: '/rep', icon: 'Award', label: 'Sales Performance' },
          { href: '/practice', icon: 'Target', label: 'AI Practice Coach' },
        ],
      },
      {
        title: 'BUSINESS',
        items: [
          { href: '/commitments', icon: 'CheckSquare', label: 'Customer Promises' },
          { href: '/services', icon: 'Briefcase', label: 'Growth Services' },
          { href: '/team', icon: 'UserCheck', label: 'Team', visible: isManagerOrOwner },
          { href: '/dss/dashboard', icon: 'GraduationCap', label: 'Digital Sales School' },
        ],
      },
      {
        title: 'SETTINGS',
        items: [
          { href: '/settings', icon: 'Settings', label: 'Settings' },
          { href: '/settings#meta-ads', icon: 'Share2', label: 'Meta Lead Ads' },
          { href: '/billing', icon: 'CreditCard', label: 'Billing', visible: isManagerOrOwner },
        ],
      },
    ];
  };

  const productNavSections = getProductNav();

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        {/* Top Brand Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap group hover:opacity-85 transition-opacity py-1"
            title="Return to CloseCraft Home"
          >
            <Logo variant={isExpanded || isMobile ? 'full' : 'icon'} size="md" alt="Closecraft" />
          </Link>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-on-surface-variant hover:text-on-surface"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-4">
          {productNavSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.visible !== false);
            return (
              <div key={section.title} className="space-y-1">
                {isExpanded || isMobile ? (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                    {section.title}
                  </div>
                ) : (
                  <div className="my-1 border-t border-outline-variant/20 mx-2" />
                )}

                {visibleItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const count = item.countKey && navCounts ? navCounts[item.countKey] : undefined;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && setIsOpen(false)}
                      title={!isExpanded && !isMobile ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative overflow-hidden ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/35 shadow-sm shadow-emerald-500/10'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-emerald-400" aria-hidden="true" />
                      )}
                      <Icon
                        name={item.icon}
                        size={17}
                        className={`shrink-0 transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-on-surface-variant group-hover:text-on-surface'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold whitespace-nowrap transition-opacity duration-150 ${
                          !isExpanded && !isMobile ? 'opacity-0 w-0' : 'opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (isExpanded || isMobile) && (
                        <span className="ml-auto text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                      {count !== undefined && count > 0 && (isExpanded || isMobile) && (
                        <span
                          className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                            item.countKey === 'followUpsDue'
                              ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                      {count !== undefined && count > 0 && !isExpanded && !isMobile && (
                        <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Operator Console (Shown only to Operator & Super Admin) */}
          {isOperator && (
            <div className="pt-2 border-t border-outline-variant/20 space-y-1">
              {isExpanded || isMobile ? (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                  Operations & Admin
                </div>
              ) : (
                <div className="my-1 border-t border-outline-variant/20 mx-2" />
              )}
              <Link
                href="/operator"
                onClick={() => isMobile && setIsOpen(false)}
                title={!isExpanded && !isMobile ? 'Operator Queue' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors group relative overflow-hidden ${
                  pathname.startsWith('/operator')
                    ? 'bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon
                  name="ShieldAlert"
                  size={18}
                  className={`shrink-0 ${
                    pathname.startsWith('/operator') ? 'text-amber-300' : 'text-on-surface-variant'
                  }`}
                />
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-opacity duration-150 ${
                    !isExpanded && !isMobile ? 'opacity-0 w-0' : 'opacity-100'
                  }`}
                >
                  Operator Queue
                </span>
              </Link>
              <Link
                href="/admin"
                onClick={() => isMobile && setIsOpen(false)}
                title={!isExpanded && !isMobile ? 'Commercial Control' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors group relative overflow-hidden ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon
                  name="Sliders"
                  size={18}
                  className={`shrink-0 ${
                    pathname.startsWith('/admin') ? 'text-amber-300' : 'text-on-surface-variant'
                  }`}
                />
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-opacity duration-150 ${
                    !isExpanded && !isMobile ? 'opacity-0 w-0' : 'opacity-100'
                  }`}
                >
                  Commercial Control
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Area: Official WhatsApp Support Link + Collapse Button */}
      <div className="p-3 border-t border-outline-variant/30 flex items-center justify-between shrink-0">
        <a
          href="https://wa.me/2349026365853?text=Hello%20CloseCraft%2C%20I%20need%20support%20with%20my%20workspace."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-surface-container-high"
          title="WhatsApp Support: +234 902 636 5853"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span
            className={`font-semibold text-xs transition-opacity duration-150 ${
              !isExpanded && !isMobile ? 'hidden' : 'inline'
            }`}
          >
            Support
          </span>
        </a>

        {!isMobile && (
          <button
            onClick={toggleExpanded}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors shrink-0"
            title="Toggle sidebar"
          >
            {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        )}
      </div>
    </aside>
  );
}
