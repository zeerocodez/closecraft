import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ShieldCheck, LogOut, LayoutDashboard, BookOpen, FileText, CheckSquare, Award, BarChart2, MessageSquare, HelpCircle, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
 const session = await auth();
 if (!session?.user) redirect('/login');

 return (
 <div className="flex h-screen bg-[#161a1d] text-gray-300 font-sans overflow-hidden relative">
 <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

 {/* Sidebar */}
 <aside className="w-[260px] bg-[#0f1214] border-r border-white/5 flex flex-col z-10 shrink-0 h-full overflow-y-auto">
 <div className="p-6">
 <Link href="/dss" className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-[#248277] flex items-center justify-center text-white">
 <ShieldCheck size={18} />
 </div>
 <div>
 <div className="font-bold text-white leading-tight">Zeerocodes DSS</div>
 <div className="text-[9px] uppercase tracking-widest text-gray-400">Learning Management</div>
 </div>
 </Link>
 </div>

 <div className="px-6 mb-6">
 <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
 <div className="w-10 h-10 rounded-full bg-[#248277] flex items-center justify-center text-white font-bold">
 {session.user.name?.substring(0, 2) || 'ST'}
 </div>
 <div className="flex-1 overflow-hidden">
 <div className="font-bold text-white text-sm truncate">{session.user.name || 'Student'}</div>
 <div className="text-xs text-[#248277]">Trainee</div>
 </div>
 </div>
 </div>

 <div className="px-6 mb-6">
 <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 w-full rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
 <LogOut size={16} /> Log out
 </button>
 </div>

 <nav className="flex-1 px-4 space-y-1">
 <Link href="/dss/dashboard" className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg font-medium text-sm transition-colors">
 <LayoutDashboard size={18} /> Dashboard
 </Link>
 <Link href="/dss/courses" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <BookOpen size={18} /> Courses
 </Link>
 <Link href="/dss/resources" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <FileText size={18} /> Resources
 </Link>
 <Link href="/dss/examinations" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <FileText size={18} /> Examinations
 </Link>
 <Link href="/dss/assignments" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <CheckSquare size={18} /> Assignments
 </Link>
 <Link href="/dss/certificates" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <Award size={18} /> Certificates
 </Link>
 <Link href="/dss/analytics" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <BarChart2 size={18} /> Analytics & Reports
 </Link>
 <Link href="/dss/messages" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <MessageSquare size={18} /> Messages
 </Link>
 <Link href="/dss/ask" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <HelpCircle size={18} /> Ask Loop
 </Link>
 <Link href="/dss/settings" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
 <Settings size={18} /> Settings
 </Link>
 </nav>
 
 <div className="p-4 mt-auto">
 <div className="text-xs text-gray-500 flex items-center gap-2">
 <HelpCircle size={14} /> Page Help
 </div>
 </div>
 </aside>

 <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
 {children}
 </main>

 {/* Floating Chat Icon */}
 <div className="absolute bottom-8 right-8 z-50">
 <button className="w-14 h-14 rounded-full bg-[#45bfae] hover:bg-[#5cd4c3] shadow-lg shadow-[#248277]/20 flex items-center justify-center text-[#0f1214] transition-transform hover:scale-105">
 <MessageSquare size={24} fill="currentColor" />
 </button>
 </div>
 </div>
 );
}
