import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BookOpen, ShieldCheck, Clock, ArrowRight, ChevronLeft, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;
  const studentId = session?.user?.id || '';

  if (!organizationId) {
    return <div className="p-8 text-center text-gray-400">Error: No organization found for LMS.</div>;
  }

  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        include: { 
          lessons: { orderBy: { orderIndex: 'asc' } },
          progress: {
            where: { studentId }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!course || course.organizationId !== organizationId) {
    return notFound();
  }

  // Calculate total completed modules
  const completedModulesCount = course.modules.filter(
    (m) => m.progress?.[0]?.status === 'COMPLETED'
  ).length;

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Back Navigation */}
      <Link 
        href="/dss/courses" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#45bfae] font-bold text-xs uppercase tracking-wider transition-colors"
      >
        <ChevronLeft size={16} /> Back to Courses
      </Link>

      {/* Course Header */}
      <div className="border-b border-white/5 pb-8">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
          <BookOpen size={14} /> Curriculum Track
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
          {course.title}
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-3xl mt-2 leading-relaxed">
          {course.description || "Follow the modules sequentially to unlock the final certification assessment and live role-play evaluations for this program."}
        </p>

        {/* Progress Summary Strip */}
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={16} className="text-[#45bfae]" />
            Sequential Progression Gated (N &rarr; N+1)
          </span>
          <span>•</span>
          <span>
            {completedModulesCount} of {course.modules.length} Modules Completed
          </span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.modules.length === 0 ? (
          <div className="col-span-full p-12 bg-[#121c1a] border border-[#248277]/30 border-dashed rounded-2xl text-center shadow-xl">
            <p className="text-gray-400 text-sm">No modules have been added to this course yet.</p>
          </div>
        ) : (
          course.modules.map((mod, index) => {
            // Sequential lock rule: Module 0 is open; Module N is locked if Module N-1 is not COMPLETED
            const isPreviousCompleted = index === 0 || course.modules[index - 1].progress?.[0]?.status === 'COMPLETED';
            const isCompleted = mod.progress?.[0]?.status === 'COMPLETED';
            const isLocked = !isPreviousCompleted && !isCompleted;

            return (
              <div 
                key={mod.id} 
                className={`group relative bg-[#121c1a] border rounded-2xl p-6 shadow-xl flex flex-col h-full overflow-hidden transition-all duration-300 ${
                  isLocked 
                    ? 'border-white/5 opacity-70' 
                    : isCompleted 
                    ? 'border-emerald-500/30' 
                    : 'border-[#248277]/40 hover:border-[#248277]/80 hover:-translate-y-1'
                }`}
              >
                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-[#0f1214]/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-gray-400 mb-3 shadow-lg">
                      <Lock size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Module Locked
                    </span>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-[200px]">
                      Complete Module {index} to unlock this workshop.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#45bfae]">
                    Module 0{mod.orderIndex + 1}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} /> {mod.lessons.length} Lessons
                    </span>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-serif font-bold text-white mb-2 line-clamp-2">
                  {mod.title}
                </h2>

                <p className="text-xs md:text-sm text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed">
                  {mod.description || "Master high-ticket technical sales frameworks, diagnostic questioning, and objection handling."}
                </p>

                <Link 
                  href={isLocked ? '#' : `/dss/module/${mod.id}`} 
                  className={`mt-auto inline-flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                    isLocked
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      : 'bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] shadow-lg'
                  }`}
                >
                  <span>{isCompleted ? 'Review Workshop' : 'Start Workshop'}</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
