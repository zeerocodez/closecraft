import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BookOpen, ShieldCheck, Clock, ArrowRight, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  
  if (!organizationId) {
    return <div>Error: No organization found for LMS.</div>;
  }

  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        include: { 
          lessons: true,
          progress: {
            where: { studentId: session?.user?.id || '' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!course || course.organizationId !== organizationId) {
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative">
      <Link href="/dss/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#45bfae] font-bold text-sm mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Courses
      </Link>
      
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
          <BookOpen size={14} /> Curriculum
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          {course.title}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          {course.description || "Follow the modules sequentially to unlock the final certification assessment and live role-play evaluations for this program."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.modules.length === 0 ? (
          <div className="col-span-full p-12 bg-[#121c1a] border border-[#248277]/30 border-dashed rounded-2xl text-center shadow-xl">
             <p className="text-gray-400 text-sm">No modules have been added to this course yet.</p>
          </div>
        ) : (
          course.modules.map((mod, index) => {
            const isLocked = index > 0 && course.modules[index-1].progress?.[0]?.status !== 'COMPLETED'; // simplified logic
            const isCompleted = mod.progress?.[0]?.status === 'COMPLETED';
            
            return (
              <div key={mod.id} className={`group relative bg-[#121c1a] border ${isLocked ? 'border-white/5 opacity-75' : 'border-[#248277]/30'} rounded-2xl p-6 shadow-xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                {isLocked && (
                  <div className="absolute inset-0 bg-[#0f1214]/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-500 mb-3">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Locked</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#45bfae]">Module {mod.orderIndex + 1}</span>
                  {isCompleted ? (
                    <span className="w-6 h-6 rounded-full bg-[#248277]/20 flex items-center justify-center text-[#45bfae]">
                      <ShieldCheck size={14} />
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> {mod.lessons.length} Lessons
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-serif font-bold text-white mb-3 line-clamp-2">
                  {mod.title}
                </h2>
                
                <p className="text-sm text-gray-400 mb-8 line-clamp-3 flex-1">
                  {mod.description || "Learn the fundamental frameworks for high-ticket technical sales in this comprehensive module."}
                </p>
                
                <Link href={`/dss/module/${mod.id}`} className="mt-auto inline-flex items-center justify-between w-full p-3 bg-white/5 hover:bg-[#248277]/20 text-white hover:text-[#45bfae] font-bold rounded-xl transition-colors border border-white/5 hover:border-[#248277]/30 group-hover:bg-[#248277]/10">
                  <span>{isCompleted ? 'Review Module' : 'Start Module'}</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
