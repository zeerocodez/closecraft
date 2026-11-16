import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Target, 
  Award, 
  Layers, 
  CheckCircle2, 
  Lock, 
  FileText, 
  BrainCircuit,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { SPRINT_WEEKS, DSS_SPRINT_FACTS } from '@/lib/dss/sprint-curriculum';

export const metadata = {
  title: 'DSS Student Hub | Digital Sales School',
  description: 'Track your four-week remote sales sprint, curriculum progression, and AI buyer simulation competency.',
};

export default async function DSSDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const orgId = (session as any)?.organizationId;
  const organizationId = orgId || (await db.organization.findFirst())?.id;

  if (!organizationId || !userId) {
    return (
      <div className="p-8 text-center text-gray-400">
        Unable to load student workspace. Please sign in or contact admissions.
      </div>
    );
  }

  // 1. Fetch Student Profile and Cohort
  let studentProfile = await db.studentProfile.findFirst({
    where: { userId },
    include: {
      enrollments: {
        include: { cohort: true },
        orderBy: { enrolledAt: 'desc' },
        take: 1
      },
      assessmentScores: true
    }
  });

  // Auto-provision student profile if enrolled in organization but record missing
  if (!studentProfile) {
    studentProfile = await db.studentProfile.create({
      data: {
        userId,
        organizationId,
        track: 'CLOSER'
      },
      include: {
        enrollments: {
          include: { cohort: true },
          orderBy: { enrolledAt: 'desc' },
          take: 1
        },
        assessmentScores: true
      }
    });
  }

  const activeCohort = studentProfile.enrollments?.[0]?.cohort;

  // 2. Fetch Modules & Lessons
  const modules = await db.module.findMany({
    where: { organizationId },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' } }
    },
    orderBy: { orderIndex: 'asc' }
  });

  // 3. Fetch Student's Lesson & Module Progress
  const lessonProgress = await db.lessonProgress.findMany({
    where: { studentId: userId }
  });
  const completedLessonIds = new Set(
    lessonProgress.filter(p => p.status === 'COMPLETED').map(p => p.lessonId)
  );

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = completedLessonIds.size;
  const overallProgressPercent = totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100);

  // 4. Identify Current Active Module & Next Incomplete Lesson
  let activeModule = null;
  let nextLesson = null;

  for (const mod of modules) {
    const incompleteLesson = mod.lessons.find(l => !completedLessonIds.has(l.id));
    if (incompleteLesson) {
      activeModule = mod;
      nextLesson = incompleteLesson;
      break;
    }
  }

  // If all completed or none found, default to first or last
  if (!activeModule && modules.length > 0) {
    activeModule = modules[modules.length - 1];
    nextLesson = activeModule.lessons[activeModule.lessons.length - 1] || null;
  }

  // 5. Fetch Recent AI Roleplay Drill Sessions
  const practiceSessions = await (db as any).practiceSession.findMany({
    where: { userId },
    include: {
      scenario: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          workshopNumber: true,
          channel: true
        }
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  const latestDrill = practiceSessions[0];
  const latestEvaluation = latestDrill?.evaluations?.[0];
  const totalDrillsCompleted = practiceSessions.filter((s: any) => s.status === 'COMPLETED').length;

  const todayStr = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short' 
  }).format(new Date());

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* 1. Header & Student Identity Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#248277]/30 to-[#45bfae]/10 border border-[#248277]/40 flex items-center justify-center text-[#45bfae] text-xl font-bold shadow-lg">
            {session?.user?.name?.substring(0, 2) || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-medium">{todayStr}</span>
              <span className="text-gray-600">•</span>
              <span className="px-2 py-0.5 rounded-full bg-[#248277]/15 text-[#45bfae] text-[11px] font-bold border border-[#248277]/30">
                {activeCohort?.name || 'Sprint Cohort Active'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Trainee'}
            </h1>
          </div>
        </div>

        {/* Quick Progression Pill */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0f1214] border border-white/5 shadow-md">
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium">Curriculum Completed</div>
            <div className="text-base font-bold text-white">
              {completedLessonsCount} <span className="text-xs font-normal text-gray-500">/ {totalLessons} Lessons</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#248277]/40 flex items-center justify-center bg-[#248277]/10 text-xs font-bold text-[#45bfae]">
            {overallProgressPercent}%
          </div>
        </div>
      </div>

      {/* 2. Attention Pod: "What should I do right now?" */}
      <section className="bg-gradient-to-r from-[#121c1a] to-[#0f1214] border border-[#248277]/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#45bfae]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/20 px-2.5 py-1 rounded-full border border-[#248277]/30">
              <PlayCircle size={13} />
              <span>Recommended Next Action</span>
            </div>

            {activeModule ? (
              <>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {nextLesson?.title || activeModule.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  {activeModule.description || 'Master sequential B2B sales frameworks, objection diagnosis, and buyer discovery.'}
                </p>
                <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen size={14} className="text-[#45bfae]" />
                    Module {activeModule.orderIndex + 1}: {activeModule.title}
                  </span>
                  <span>•</span>
                  <span>Sequential Locking Enabled (N &rarr; N+1)</span>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  All Curriculum Lessons Complete!
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  You have fulfilled all required curriculum topics. You are eligible to take your final AI Certification Examination.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {activeModule && (
              <Link
                href={`/dss/module/${activeModule.id}${nextLesson ? `?lesson=${nextLesson.id}` : ''}`}
                className="px-6 py-3.5 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-xl transition-all shadow-lg shadow-[#248277]/20 flex items-center justify-center gap-2 group text-sm"
              >
                <span>Resume Lesson</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              href="/dss/roleplay"
              className="px-5 py-3.5 bg-[#248277]/15 hover:bg-[#248277]/25 text-[#45bfae] hover:text-[#5cd4c3] font-bold rounded-xl border border-[#248277]/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles size={16} />
              <span>AI Buyer Practice</span>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
          <span>Overall Sprint Progress: {completedLessonsCount} of {totalLessons} topics verified</span>
          <div className="w-full sm:w-64 h-2 bg-[#0a0d12] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#248277] to-[#45bfae] transition-all duration-500" 
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. 4-Week Sprint Milestone Roadmap */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Curriculum Roadmap (4-Week Sprint)</h3>
            <p className="text-xs text-gray-400">12 practical workshops, 24 original topics, and 8-criterion competency evaluations.</p>
          </div>
          <Link href="/dss/courses" className="text-xs font-bold text-[#45bfae] hover:text-[#5cd4c3] flex items-center gap-1">
            <span>Explore All</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPRINT_WEEKS.map((week, idx) => {
            const isCompleted = overallProgressPercent >= ((idx + 1) * 25);
            const isCurrent = !isCompleted && overallProgressPercent >= (idx * 25);
            const isLocked = !isCompleted && !isCurrent;

            return (
              <div 
                key={week.weekNumber}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'bg-[#121c1a] border-[#248277]/60 shadow-lg shadow-[#248277]/10' 
                    : isCompleted 
                    ? 'bg-[#0f1214] border-white/10 opacity-90' 
                    : 'bg-[#0a0d12] border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#45bfae]">
                    Week 0{week.weekNumber}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={14} /> Passed
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#45bfae]/20 text-[#45bfae] text-[10px] font-bold border border-[#45bfae]/30">
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm mb-2 line-clamp-2">
                  {week.title}
                </h4>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                  {week.copy}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Workshops {week.workshops[0]}–{week.workshops[week.workshops.length - 1]}</span>
                  <span className="font-mono text-gray-400">9 hrs</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AI Practice Studio & Competency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Studio Widget */}
        <div className="lg:col-span-2 bg-[#0f1214] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae]">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base">
                  Practice Studio & AI Buyer Roleplay
                </h3>
                <p className="text-xs text-gray-400">
                  Realistic buyer personas, 8-criterion rubric grading, and sentence upgrades.
                </p>
              </div>
            </div>
            <Link
              href="/dss/roleplay"
              className="text-xs font-bold text-[#45bfae] hover:text-[#5cd4c3] flex items-center gap-1"
            >
              <span>Launch Studio</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Drill Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Drills Completed</div>
              <div className="text-2xl font-serif font-bold text-white">
                {totalDrillsCompleted}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Multi-turn AI drills</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">Latest Rubric Score</div>
              <div className="text-2xl font-serif font-bold text-white flex items-baseline gap-1">
                {latestEvaluation ? `${latestEvaluation.totalScore}` : '--'}
                <span className="text-xs font-normal text-gray-500">/ 16 pts</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {latestEvaluation?.passedThreshold ? '✅ Met standard (12/16)' : 'Passing bar: 12/16'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121c1a] border border-[#248277]/30">
              <div className="text-xs text-[#45bfae] font-semibold mb-1">Active Rubric</div>
              <div className="text-sm font-bold text-white">
                DSS 8-Criterion
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Enterprise B2B Standard</div>
            </div>
          </div>

          {/* Recent Drills List */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Recent Practice Scenarios
            </div>

            {practiceSessions.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                <p className="text-xs text-gray-400">
                  No simulations attempted yet. Launch a practice drill to sharpen your objection handling and discovery.
                </p>
                <Link
                  href="/dss/roleplay"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#248277] text-white text-xs font-bold hover:bg-[#2e9c8f] transition-colors"
                >
                  <Sparkles size={14} /> Start First Roleplay Drill
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {practiceSessions.slice(0, 3).map((sessionItem: any) => {
                  const evalItem = sessionItem.evaluations?.[0];
                  return (
                    <div 
                      key={sessionItem.id} 
                      className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#45bfae] font-bold">
                          {sessionItem.scenario?.workshopNumber ? `W${sessionItem.scenario.workshopNumber}` : 'RP'}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {sessionItem.scenario?.title || 'Practice Simulation'}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Channel: {sessionItem.scenario?.channel || 'WHATSAPP'} • {sessionItem.scenario?.difficulty || 'INTERMEDIATE'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {evalItem ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            evalItem.passedThreshold 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {evalItem.totalScore}/16 pts
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">In Progress</span>
                        )}
                        <Link
                          href={`/dss/roleplay/session/${sessionItem.id}`}
                          className="text-[#45bfae] hover:text-[#5cd4c3] font-bold"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Examinations & Credential Card */}
        <div className="space-y-6">
          {/* AI Assessor Card */}
          <div className="bg-[#0f1214] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/5 text-[#45bfae]">
                <Award size={18} />
              </div>
              <h3 className="font-serif font-bold text-white text-base">
                Certification Exam
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Complete all 12 workshops to unlock the final 45-minute live AI-graded assessment and earn your verified DSS digital credential.
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Eligibility Status</span>
                <span className={`font-bold ${overallProgressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {overallProgressPercent === 100 ? 'Unlocked' : `${totalLessons - completedLessonsCount} Lessons Remaining`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0d12] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#248277]" 
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            <Link
              href="/dss/examinations"
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                overallProgressPercent === 100
                  ? 'bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3]'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{overallProgressPercent === 100 ? 'Take Certification Exam' : 'Check Eligibility Requirements'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Playbooks & Resources Card */}
          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#248277]/20 text-[#45bfae]">
                <FileText size={18} />
              </div>
              <h3 className="font-serif font-bold text-white text-base">
                Playbooks & Vault
              </h3>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Download proven B2B sales scripts, MEDDPICC qualification rubrics, and objection diagnostic frameworks.
            </p>

            <Link
              href="/dss/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45bfae] hover:text-[#5cd4c3] transition-colors"
            >
              <span>Access Downloadable Guides</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
