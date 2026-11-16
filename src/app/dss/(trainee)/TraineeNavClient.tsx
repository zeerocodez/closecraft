'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Sparkles, 
  BarChart2, 
  Award, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Settings, 
  Building2, 
  ExternalLink,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { Logo, DSSLogo } from '@/components/ui/Logo';

interface TraineeNavClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string;
  };
  businessMembership?: {
    organization: {
      name: string;
      id: string;
    };
  } | null;
  children: React.ReactNode;
}

export default function TraineeNavClient({
  user,
  businessMembership,
  children
}: TraineeNavClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || '';

  const isActive = (href: string) => {
    if (href === '/dss/dashboard') {
      return pathname === '/dss/dashboard' || pathname === '/dss';
    }
    return pathname.startsWith(href);
  };

  const navLinks = [
    { href: '/dss/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dss/courses', label: 'My Learning', icon: BookOpen },
    { 
      href: '/dss/roleplay', 
      label: 'Practice Studio', 
      icon: Sparkles, 
      highlight: true, 
      badge: 'AI Sim' 
    },
    { href: '/dss/analytics', label: 'My Progress', icon: BarChart2 },
    { href: '/dss/examinations', label: 'Assessments', icon: Award },
  ];

  const secondaryLinks = [
    { href: '/dss/assignments', label: 'Assignments', icon: CheckSquare },
    { href: '/dss/certificates', label: 'Certificates', icon: Award },
    { href: '/dss/resources', label: 'Playbooks & Guides', icon: FileText },
    { href: '/dss/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dss/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#161a1d] text-gray-300 font-sans overflow-hidden relative">
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f1214] border-b border-white/5 z-40 shrink-0">
        <Link href="/dss" className="flex items-center gap-2">
          <DSSLogo variant="icon" size="sm" alt="Digital Sales School" />
          <span className="font-serif font-bold text-white text-base">Digital Sales School</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dss/roleplay"
            className="px-2.5 py-1 rounded-lg bg-[#248277]/20 border border-[#248277]/30 text-[#45bfae] text-xs font-bold flex items-center gap-1"
          >
            <Sparkles size={13} /> AI Sim
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Slide-Over) */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-[270px] bg-[#0f1214] border-r border-white/5 flex flex-col z-50 shrink-0 h-full overflow-y-auto transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link href="/dss" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <DSSLogo variant="full" size="md" alt="Digital Sales School" />
          </Link>
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student Avatar Card */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#248277] flex items-center justify-center text-white font-bold shrink-0">
              {user.name?.substring(0, 2) || 'ST'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{user.name || 'Student'}</div>
              <div className="text-xs text-[#45bfae] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45bfae] animate-pulse"></span>
                DSS Trainee
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Switcher for Dual-Role Users */}
        {businessMembership && (
          <div className="px-5 mb-3">
            <Link
              href="/today"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-xs font-medium text-emerald-400 hover:text-white px-3 py-2 rounded-xl bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 transition-all w-full group"
              title={`Switch to Closecraft workspace: ${businessMembership.organization.name}`}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">{businessMembership.organization.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform shrink-0">&rarr;</span>
            </Link>
          </div>
        )}

        {/* Primary Trainee Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const IconComponent = link.icon;

            if (link.highlight) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors border ${
                    active
                      ? 'bg-[#248277]/25 text-[#5cd4c3] border-[#248277]/40 shadow-[0_0_15px_rgba(36,130,119,0.2)]'
                      : 'bg-[#248277]/10 hover:bg-[#248277]/20 text-[#45bfae] hover:text-[#5cd4c3] border-[#248277]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} className="text-[#45bfae]" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#45bfae]/20 text-[#45bfae] font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent size={18} className={active ? 'text-[#45bfae]' : ''} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Curriculum Activities</div>
          </div>

          {secondaryLinks.map((link) => {
            const active = isActive(link.href);
            const IconComponent = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent size={16} className={active ? 'text-[#45bfae]' : ''} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Powered by Closecraft Engine Badge */}
        <div className="p-4 mt-auto border-t border-white/5 bg-black/20 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors"
            title="Powered by Closecraft Revenue Operating System"
          >
            <div className="flex items-center gap-2">
              <Logo variant="icon" size="xs" />
              <span className="text-[11px]">Powered by <strong className="text-white">Closecraft</strong></span>
            </div>
            <ExternalLink size={12} className="text-gray-500" />
          </Link>
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Simulation Engine v2.4</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">8-Rubric</span>
          </div>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {children}
      </main>

      {/* Floating Ask Faculty / AI Coach Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link
          href="/dss/ask"
          className="w-12 h-12 rounded-full bg-[#45bfae] hover:bg-[#5cd4c3] shadow-lg shadow-[#248277]/30 flex items-center justify-center text-[#0f1214] transition-transform hover:scale-105 p-3"
          title="Ask DSS Faculty & AI Coach"
        >
          <MessageSquare size={20} fill="currentColor" />
        </Link>
      </div>
    </div>
  );
}
