import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { BookOpen, ShieldCheck, ArrowRight, Layers, Clock, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Training Programs & Courses | Digital Sales School',
  description: 'Explore verified digital sales curriculum pathways, workshops, and high-stakes certifications.',
};

export default async function CoursesPage() {
  const session = await auth();
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;

  if (!organizationId) {
    return (
      <div className="p-8 text-center text-gray-400">
        No organization found for LMS. Please contact support.
      </div>
    );
  }

  const courses = await db.course.findMany({
    where: { organizationId },
    include: { 
      modules: {
        include: { lessons: true },
        orderBy: { orderIndex: 'asc' }
      },
      enrollments: {
        where: { studentId: session?.user?.id || '' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-white/5 pb-8">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-3">
          <BookOpen size={14} /> Curriculum Tracks
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
          Training Programs & Courses
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
          Structured sequential learning designed to build measurable remote sales competency. Every program includes practical workshop topics, AI buyer roleplays, and formal certification.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full p-12 bg-[#121c1a] border border-[#248277]/30 border-dashed rounded-2xl text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#248277]/10 flex items-center justify-center mx-auto mb-4 text-[#45bfae]">
              <BookOpen size={28} />
            </div>
            <h3 className="font-serif font-bold text-white text-xl mb-2">No Courses Available</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your organization has not published any training courses yet. Please check back shortly or speak with your cohort lead.
            </p>
          </div>
        ) : (
          courses.map((course) => {
            const isEnrolled = course.enrollments.length > 0;
            const totalModules = course.modules.length;
            const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
            
            const priceDisplay = course.isFree 
              ? 'Free Access'
              : course.currency === 'NGN'
                ? `₦${(course.price || 0).toLocaleString()}`
                : `$${course.price || 0}`;

            return (
              <div 
                key={course.id} 
                className="group relative bg-[#121c1a] border border-[#248277]/30 hover:border-[#248277]/60 rounded-2xl p-6 shadow-xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#45bfae]">
                    Flagship Program
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#45bfae]/10 px-2.5 py-1 rounded-md border border-[#45bfae]/20">
                      {priceDisplay}
                    </span>
                    {isEnrolled && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-2 group-hover:text-[#5cd4c3] transition-colors line-clamp-2">
                  {course.title}
                </h2>

                <p className="text-xs md:text-sm text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed">
                  {course.description || "Master foundational and advanced digital sales techniques, MEDDPICC discovery, and multi-channel closing."}
                </p>

                <div className="flex items-center gap-4 py-3 border-y border-white/5 mb-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers size={14} className="text-[#45bfae]" /> {totalModules} Modules
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen size={14} className="text-[#45bfae]" /> {totalLessons} Lessons
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} className="text-[#45bfae]" /> AI Roleplay
                  </span>
                </div>

                <Link 
                  href={`/dss/courses/${course.slug}`} 
                  className="mt-auto inline-flex items-center justify-between w-full px-4 py-3 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-all shadow-lg text-sm group"
                >
                  <span>
                    {isEnrolled ? 'Continue Course' : (course.isFree ? 'Enroll for Free' : `View Curriculum`)}
                  </span>
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
