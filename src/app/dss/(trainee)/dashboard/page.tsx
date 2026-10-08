import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ShieldCheck, FileText, PlayCircle } from 'lucide-react';

export default async function DSSDashboardPage() {
  const session = await auth();
  const orgId = (session as any).organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId) {
    return <div>Error: No organization found for LMS.</div>;
  }

  const modules = await db.module.findMany({
    where: { organizationId },
    include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { orderIndex: 'asc' }
  });

  const activeModule = modules.length > 0 ? modules[0] : null;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <div className="max-w-5xl mx-auto w-full p-8 md:p-12">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#248277]/20 flex items-center justify-center text-[#45bfae] text-xl font-bold border border-[#248277]/30 shadow-lg">
            {session?.user?.name?.substring(0, 2) || 'ST'}
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Good afternoon</div>
            <h1 className="text-3xl font-serif font-bold text-white mb-1">{session?.user?.name || 'Student'}</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Trainee</span>
              <span className="px-2 py-0.5 rounded-full bg-[#248277]/20 text-[#45bfae] font-medium border border-[#248277]/30">Active</span>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div className="text-gray-400 mb-1">{today}</div>
          <div>Last visit: Yesterday at 9:47 AM</div>
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-6 font-medium">
        1 course in progress
      </div>

      {/* Continue Learning Card */}
      {activeModule && (
        <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-6 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2 py-1 rounded-full border border-[#248277]/20">
            PAID <ShieldCheck size={12} />
          </div>
          
          <div className="text-xs font-bold uppercase tracking-widest text-[#45bfae] mb-2">Continue Learning</div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2 uppercase">{activeModule.title}</h2>
          <div className="text-sm text-gray-400 mb-8">
            Next: {activeModule.lessons[0]?.title || 'Lesson 1'}
          </div>

          <div className="text-xs text-gray-500 mb-2">
            0 of {activeModule.lessons.length} lessons complete
          </div>
          <div className="w-full h-1.5 bg-[#0f1214] rounded-full overflow-hidden mb-6 border border-white/5">
            <div className="h-full bg-[#248277] w-[0%]"></div>
          </div>

          <Link href={`/dss/module/${activeModule.id}`} className="inline-flex items-center justify-center px-8 py-3 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-colors">
            Resume
          </Link>
        </div>
      )}

      {/* Examinations Stats */}
      <div className="bg-[#0f1214] border border-white/5 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <FileText size={14} /> Your Examinations
          </div>
          <Link href="/dss/examinations" className="text-sm text-[#45bfae] hover:text-[#5cd4c3] transition-colors">View All</Link>
        </div>
        
        <div className="grid grid-cols-3 divide-x divide-white/5 text-center">
          <div>
            <div className="text-3xl font-serif font-bold text-white mb-1">1</div>
            <div className="text-xs text-gray-500 font-medium">Available</div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-white mb-1">0</div>
            <div className="text-xs text-gray-500 font-medium">In Progress</div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-white mb-1">0</div>
            <div className="text-xs text-[#248277] font-medium">Passed</div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <div className="bg-[#0f1214] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <PlayCircle size={14} /> Quick Actions
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/dss/module/${activeModule?.id || '#'}`} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-sm font-medium text-white transition-colors border border-white/5 hover:border-white/10">
              Continue Learning
            </Link>
            <Link href="/dss/roleplay" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-sm font-medium text-white transition-colors border border-white/5 hover:border-white/10">
              Take Assessment
            </Link>
            <Link href="/dss/messages" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center text-sm font-medium text-white transition-colors border border-white/5 hover:border-white/10">
              Messages
            </Link>
            <button className="p-4 bg-[#121c1a] hover:bg-[#182623] rounded-xl text-center text-sm font-medium text-[#45bfae] transition-colors border border-[#248277]/30">
              Notifications (1 New)
            </button>
          </div>
        </div>

        {/* Courses Available */}
        <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
          <h3 className="text-xl font-bold text-white mb-2">2 courses available</h3>
          <p className="text-sm text-gray-400 mb-6">Browse course content — reading materials and lessons.</p>
          <Link href="/dss/courses" className="inline-flex items-center justify-center px-6 py-3 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-colors self-start">
            Browse Courses
          </Link>
        </div>
        
      </div>

    </div>
  );
}
