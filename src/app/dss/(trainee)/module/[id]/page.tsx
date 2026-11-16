import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  ShieldCheck, 
  Sparkles,
  Download,
  Clock,
  Layers
} from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ModulePage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }; 
  searchParams: { lesson?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const studentId = session.user.id || '';
  
  const moduleData = await db.module.findUnique({
    where: { id: params.id },
    include: { 
      lessons: { orderBy: { orderIndex: 'asc' } },
      progress: { where: { studentId } }
    }
  });

  if (!moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        Module not found.
      </div>
    );
  }
  
  // Fetch lesson progress
  const lessonProgress = await db.lessonProgress.findMany({
    where: { studentId, lesson: { moduleId: moduleData.id } }
  });
  
  const completedLessonIds = new Set(lessonProgress.filter(p => p.status === 'COMPLETED').map(p => p.lessonId));
  
  const totalLessons = moduleData.lessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  // Map module to DSS workshop scenario (1 to 12)
  const workshopNum = (moduleData.orderIndex % 12) + 1;
  const matchingScenario = (await (db as any).practiceScenario.findFirst({
    where: { workshopNumber: workshopNum },
    select: { id: true, title: true, slug: true, workshopNumber: true, difficulty: true }
  })) || (await (db as any).practiceScenario.findFirst({
    select: { id: true, title: true, slug: true, workshopNumber: true, difficulty: true }
  }));

  // Track student's demonstrated competence on this skill
  const practiceAttempt = matchingScenario ? await (db as any).practiceSession.findFirst({
    where: {
      userId: studentId,
      scenarioId: matchingScenario.id,
    },
    include: {
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  }) : null;
  const latestEvaluation = practiceAttempt?.evaluations?.[0];
  
  // Determine current lesson
  let activeLessonIndex = 0;
  if (searchParams.lesson) {
    activeLessonIndex = moduleData.lessons.findIndex(l => l.id === searchParams.lesson);
    if (activeLessonIndex === -1) activeLessonIndex = 0;
  } else {
    // Find first incomplete
    activeLessonIndex = moduleData.lessons.findIndex(l => !completedLessonIds.has(l.id));
    if (activeLessonIndex === -1 && totalLessons > 0) activeLessonIndex = totalLessons - 1;
    if (activeLessonIndex === -1) activeLessonIndex = 0;
  }
  
  const activeLesson = moduleData.lessons[activeLessonIndex];
  
  // Server Action to complete lesson
  async function completeLesson(formData: FormData) {
    'use server';
    const session = await auth();
    if (!session?.user?.id) return;
    const lessonId = formData.get('lessonId') as string;
    const moduleId = formData.get('moduleId') as string;
    
    await db.lessonProgress.upsert({
      where: {
        studentId_lessonId: { studentId: session.user.id, lessonId }
      },
      update: { status: 'COMPLETED', completedAt: new Date() },
      create: {
        studentId: session.user.id,
        lessonId,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Check if module is complete
    const lessonCount = await db.lesson.count({ where: { moduleId } });
    const compCount = await db.lessonProgress.count({ 
      where: { studentId: session.user.id, lesson: { moduleId }, status: 'COMPLETED' }
    });
    
    if (compCount >= lessonCount) {
      await db.moduleProgress.upsert({
        where: { studentId_moduleId: { studentId: session.user.id, moduleId } },
        update: { status: 'COMPLETED', completedAt: new Date() },
        create: {
          studentId: session.user.id,
          moduleId,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    }
    
    revalidatePath(`/dss/module/${moduleId}`);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          <Link 
            href="/dss/dashboard" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          <div className="flex items-center gap-2 font-serif font-bold text-white text-base md:text-lg">
            <span>Module {moduleData.orderIndex + 1}:</span>
            <span className="text-[#45bfae] truncate max-w-xs md:max-w-md">{moduleData.title}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] font-bold text-xs uppercase shadow-lg">
            {session.user.name?.substring(0, 2) || 'ST'}
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto overflow-hidden">
        {/* Left Sidebar: Lesson List */}
        <aside className="w-full lg:w-80 border-r border-white/5 bg-[#0a0d12] flex flex-col shrink-0 lg:h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6 border-b border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#45bfae] mb-3">
              Curriculum Progress
            </div>
            <div className="w-full h-1.5 bg-[#0f1214] rounded-full overflow-hidden mb-3 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#248277] to-[#45bfae] transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 font-medium flex justify-between">
              <span>{completedCount} of {totalLessons} Lessons</span>
              <span className="font-bold text-[#45bfae]">{progressPercent}%</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 space-y-1.5">
            {moduleData.lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              // Lesson N is unlocked if Lesson N-1 is completed
              const isLocked = index > 0 && !completedLessonIds.has(moduleData.lessons[index-1].id);
              const isActive = index === activeLessonIndex;

              return (
                <Link 
                  key={lesson.id} 
                  href={isLocked ? '#' : `/dss/module/${moduleData.id}?lesson=${lesson.id}`}
                  className={`w-full text-left p-3.5 rounded-xl flex gap-3 items-start transition-all ${
                    isActive 
                      ? 'bg-[#248277]/15 border border-[#248277]/40 shadow-lg shadow-[#248277]/10' 
                      : isLocked 
                      ? 'opacity-40 cursor-not-allowed border border-transparent' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${
                    isActive ? 'text-[#45bfae]' : isCompleted ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    {isCompleted && !isActive ? (
                      <CheckCircle size={16} />
                    ) : isLocked ? (
                      <Lock size={16} />
                    ) : (
                      <PlayCircle size={16} className={isActive ? "fill-[#248277]/20" : ""} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs md:text-sm font-bold truncate ${
                      isActive || isCompleted ? 'text-white' : 'text-gray-400'
                    }`}>
                      {index + 1}. {lesson.title}
                    </div>
                    <div className={`text-[11px] mt-0.5 font-medium ${
                      isActive ? 'text-[#45bfae]' : isLocked ? 'text-gray-600' : isCompleted ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {isActive ? 'Playing Now' : isLocked ? 'Locked (Sequential)' : isCompleted ? 'Completed' : 'Ready'}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Assessment / Roleplay Lock */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <Link 
                href={progressPercent === 100 ? "/dss/roleplay" : "#"} 
                className={`w-full text-left p-3.5 rounded-xl flex gap-3 items-start ${
                  progressPercent === 100 
                    ? 'bg-[#45bfae]/10 border border-[#45bfae]/30 hover:bg-[#45bfae]/20' 
                    : 'opacity-40 cursor-not-allowed border border-transparent'
                }`}
              >
                <div className={`mt-0.5 ${progressPercent === 100 ? 'text-[#45bfae]' : 'text-gray-500'}`}>
                  {progressPercent === 100 ? <ShieldCheck size={18} /> : <Lock size={18} />}
                </div>
                <div className="flex-1">
                  <div className={`text-xs md:text-sm font-bold ${progressPercent === 100 ? 'text-white' : 'text-gray-400'}`}>
                    Module Assessment
                  </div>
                  <div className={`text-[11px] mt-0.5 ${progressPercent === 100 ? 'text-[#45bfae]' : 'text-gray-500'}`}>
                    {progressPercent === 100 ? 'Unlocked — Start AI Roleplay' : 'Complete all lessons to unlock'}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Content Area: Video & Materials */}
        <div className="flex-1 flex flex-col h-full lg:h-[calc(100vh-4rem)] overflow-y-auto">
          {activeLesson ? (
            <>
              {/* Video Player Container */}
              <div className="w-full aspect-video max-h-[500px] bg-black flex items-center justify-center relative border-b border-white/5 shadow-2xl">
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 z-10">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#45bfae] mb-1 drop-shadow-md">
                    Lesson 0{activeLessonIndex + 1}
                  </div>
                  <div className="text-white font-serif font-bold text-2xl md:text-3xl drop-shadow-lg">
                    {activeLesson.title}
                  </div>
                </div>

                {/* Big Center Play Overlay */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#248277]/80 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-[#248277] transition-all hover:scale-105 shadow-[0_0_30px_rgba(36,130,119,0.5)] z-20 border border-[#45bfae]/30">
                  <PlayCircle className="text-white" size={36} fill="rgba(69, 191, 174, 0.2)" />
                </div>
              </div>

              {/* Transcript & Materials */}
              <div className="flex-1 bg-[#0d1117] p-6 md:p-10">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                      <h2 className="font-serif font-bold text-xl text-white">Lesson Overview</h2>
                      <p className="text-gray-400 text-xs">Instructor: Zeerocodes DSS Faculty</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {matchingScenario && (
                        <Link
                          href={`/dss/roleplay?scenarioId=${matchingScenario.id}&lessonId=${activeLesson.id}&moduleId=${moduleData.id}`}
                          className={`px-4 py-2.5 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-xs ${
                            latestEvaluation?.passedThreshold
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : latestEvaluation
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                              : 'bg-[#248277] text-white hover:bg-[#2e9c8f] shadow-[#248277]/20'
                          }`}
                          title="Practice this skill with realistic AI buyer simulation"
                        >
                          <Sparkles size={15} className="text-[#45bfae]" />
                          <span>
                            {latestEvaluation?.passedThreshold
                              ? `Demonstrated Competence (${latestEvaluation.totalScore}/16 pts)`
                              : latestEvaluation
                              ? `Retry Practice (${latestEvaluation.totalScore}/16 pts)`
                              : 'Practise this skill'}
                          </span>
                        </Link>
                      )}

                      <form action={completeLesson}>
                        <input type="hidden" name="lessonId" value={activeLesson.id} />
                        <input type="hidden" name="moduleId" value={moduleData.id} />
                        <button 
                          type="submit" 
                          disabled={completedLessonIds.has(activeLesson.id)}
                          className={`px-6 py-2.5 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all text-xs ${
                            completedLessonIds.has(activeLesson.id) 
                              ? 'bg-white/5 text-[#45bfae] cursor-default border border-white/5' 
                              : 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3]'
                          }`}
                        >
                          <CheckCircle size={15} /> 
                          {completedLessonIds.has(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Transcript Content */}
                  <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 font-sans leading-relaxed">
                    <p>
                      {activeLesson.transcript || 'No transcript available for this lesson yet. Watch the video above to master this concept.'}
                    </p>
                  </div>

                  {/* Attached Materials Card */}
                  <div className="p-6 bg-[#121c1a] rounded-2xl border border-[#248277]/20 shadow-xl space-y-4">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                      <BookOpen size={18} className="text-[#45bfae]" /> Attached Playbooks & Guides
                    </h4>

                    {activeLesson.contentUrl ? (
                      <a 
                        href={activeLesson.contentUrl} 
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 p-3.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 text-xs font-bold text-[#45bfae]"
                      >
                        <Download size={16} />
                        <span>Download Playbook / PDF Reference Guide</span>
                      </a>
                    ) : (
                      <div className="text-xs text-gray-500 font-medium">
                        No supplementary attachments required for this lesson.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No lessons available in this module.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
