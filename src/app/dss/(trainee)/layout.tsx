import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  ShieldCheck, 
  ArrowLeft, 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Award, 
  BarChart2, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  Sparkles,
  Building2,
  ExternalLink
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { Logo, DSSLogo } from '@/components/ui/Logo';

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Check if user is a dual-role member of an active business organization
  const businessMembership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true }
  });

  return (
    <div className="flex h-screen bg-[#161a1d] text-gray-300 font-sans overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Sidebar */}
      <aside className="w-[270px] bg-[#0f1214] border-r border-white/5 flex flex-col z-10 shrink-0 h-full overflow-y-auto">
        <div className="p-6 pb-4">
          <Link href="/dss" className="flex items-center gap-3">
            <DSSLogo variant="full" size="md" alt="Digital Sales School" />
          </Link>
        </div>

        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#248277] flex items-center justify-center text-white font-bold shrink-0">
              {session.user.name?.substring(0, 2) || 'ST'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{session.user.name || 'Student'}</div>
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
          <Link 
            href="/dss/dashboard" 
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium text-sm transition-colors"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link 
            href="/dss/courses" 
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <BookOpen size={18} /> My Learning
          </Link>

          <Link 
            href="/dss/roleplay" 
            className="flex items-center justify-between px-3 py-2.5 bg-[#248277]/10 hover:bg-[#248277]/20 text-[#45bfae] hover:text-[#5cd4c3] rounded-xl font-semibold text-sm transition-colors border border-[#248277]/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-[#45bfae]" />
              <span>Practice Studio</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#45bfae]/20 text-[#45bfae] font-bold">
              AI Sim
            </span>
          </Link>

          <Link 
            href="/dss/analytics" 
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <BarChart2 size={18} /> My Progress
          </Link>

          <Link 
            href="/dss/examinations" 
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <Award size={18} /> Assessments
          </Link>

          <div className="pt-2 pb-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">Curriculum Activities</div>
          </div>

          <Link 
            href="/dss/assignments" 
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <CheckSquare size={16} /> Assignments
          </Link>

          <Link 
            href="/dss/certificates" 
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <Award size={16} /> Certificates
          </Link>

          <Link 
            href="/dss/resources" 
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <FileText size={16} /> Playbooks & Guides
          </Link>

          <Link 
            href="/dss/messages" 
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <MessageSquare size={16} /> Messages
          </Link>

          <Link 
            href="/dss/settings" 
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors"
          >
            <Settings size={16} /> Settings
          </Link>
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

      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {children}
      </main>

      {/* Floating Chat Icon */}
      <div className="absolute bottom-8 right-8 z-50">
        <Link
          href="/dss/ask"
          className="w-13 h-13 rounded-full bg-[#45bfae] hover:bg-[#5cd4c3] shadow-lg shadow-[#248277]/30 flex items-center justify-center text-[#0f1214] transition-transform hover:scale-105 p-3.5"
          title="Ask DSS Faculty & AI Coach"
        >
          <MessageSquare size={22} fill="currentColor" />
        </Link>
      </div>
    </div>
  );
}
