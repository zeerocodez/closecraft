import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { listAuthorisedScenarios } from '@/lib/practice/scenarios';
import LaunchDrillButton from '@/components/practice/LaunchDrillButton';
import { 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Target, 
  AlertCircle,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const metadata = {
  title: 'DSS Practice Studio | Digital Sales School',
  description: 'AI-powered realistic buyer simulations and 8-criterion rubric coaching.',
};

export default async function DSSPracticeStudioPage({
  searchParams,
}: {
  searchParams: Promise<{
    sprint?: string;
    scenarioId?: string;
    lessonId?: string;
    moduleId?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const params = await searchParams;
  const activeSprint = params?.sprint ? parseInt(params.sprint, 10) : 0; // 0 = all

  // Fetch all DSS curriculum scenarios (sanitized projections)
  const allScenarios = await listAuthorisedScenarios({
    organizationId: null, // Global DSS curriculum
  });

  // Filter by sprint if selected
  const filteredScenarios = allScenarios.filter((s) => {
    if (!activeSprint) return true;
    if (activeSprint === 1) return s.workshopNumber && s.workshopNumber >= 1 && s.workshopNumber <= 3;
    if (activeSprint === 2) return s.workshopNumber && s.workshopNumber >= 4 && s.workshopNumber <= 6;
    if (activeSprint === 3) return s.workshopNumber && s.workshopNumber >= 7 && s.workshopNumber <= 9;
    if (activeSprint === 4) return (s.workshopNumber && s.workshopNumber >= 10 && s.workshopNumber <= 12) || s.isCapstone;
    return true;
  });

  // Fetch student's recent practice sessions and scores
  const studentSessionsRaw = await (prisma as any).practiceSession.findMany({
    where: { userId: session.user.id },
    include: {
      scenario: {
        select: {
          id: true,
          title: true,
          workshopNumber: true,
          workshopTitle: true,
          difficulty: true,
          channel: true,
        },
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          totalScore: true,
          passedThreshold: true,
          objectiveOutcome: true,
          strongestBehaviour: true,
          prioritisedCorrection: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  const studentSessions = studentSessionsRaw as Array<{
    id: string;
    scenarioId: string;
    status: string;
    mode: string;
    currentTurnCount: number;
    createdAt: Date;
    scenario: {
      id: string;
      title: string;
      workshopNumber?: number | null;
      workshopTitle?: string | null;
      difficulty: string;
      channel: string;
    };
    evaluations: Array<{
      id: string;
      totalScore: number;
      passedThreshold: boolean;
      objectiveOutcome: string;
      strongestBehaviour: string;
      prioritisedCorrection: string;
      createdAt: Date;
    }>;
  }>;

  // Check for any in-progress attempt that can be resumed
  const inProgressAttempt = studentSessions.find((s) => s.status === 'IN_PROGRESS');

  // Highlight specific scenario if requested via query (e.g. from a lesson "Practise this skill" button)
  const targetScenario = params?.scenarioId
    ? allScenarios.find((s) => s.id === params.scenarioId || s.slug === params.scenarioId)
    : null;

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/10 border border-[#248277]/30 text-xs font-bold text-[#45bfae] mb-3">
            <Sparkles size={14} />
            <span>Digital Sales School Practice Studio</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 font-normal">Powered by Closecraft Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Sales Buyer Simulator & Role-Play
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Practice real multi-turn sales scenarios with realistic buyer personas. Receive immediate 8-criterion rubric scoring, evidence quotes, and coaching sentence upgrades before live certification.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-xl shrink-0">
          <div className="text-center px-3 border-r border-white/10">
            <div className="text-2xl font-serif font-bold text-white">{studentSessions.length}</div>
            <div className="text-[11px] text-gray-400 font-medium">Drills Completed</div>
          </div>
          <div className="text-center px-3">
            <div className="text-2xl font-serif font-bold text-[#45bfae]">
              {studentSessions.filter(s => s.evaluations[0]?.passedThreshold).length}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">Passed Rubrics</div>
          </div>
        </div>
      </div>

      {/* Target Scenario Banner (If redirected from a lesson) */}
      {targetScenario && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#248277]/20 via-[#121c1a] to-emerald-950/30 border border-[#45bfae]/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#45bfae] mb-1">
                <Target size={15} />
                <span>Assigned Lesson Exercise</span>
                {targetScenario.workshopNumber && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">
                    Workshop {targetScenario.workshopNumber}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold text-white">{targetScenario.title}</h3>
              <p className="text-sm text-gray-300 mt-1 max-w-2xl">{targetScenario.studentBrief}</p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              {params?.lessonId && (
                <Link
                  href={`/dss/module/${params.moduleId || ''}?lesson=${params.lessonId}`}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs transition-colors border border-white/10"
                >
                  &larr; Return to Lesson
                </Link>
              )}
              <LaunchDrillButton
                scenarioId={targetScenario.id}
                assignmentId={params?.lessonId}
                lessonId={params?.lessonId}
                moduleId={params?.moduleId}
                variant="dss"
                label="Launch Assigned Drill"
                className="px-6 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resumable Session Alert */}
      {inProgressAttempt && !targetScenario && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-amber-400 shrink-0" size={20} />
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Unfinished Drill Available</div>
              <div className="text-sm font-medium text-white">
                You have an in-progress session on: <strong>{inProgressAttempt.scenario.title}</strong>
              </div>
            </div>
          </div>
          <Link
            href={`/dss/roleplay/session/${inProgressAttempt.id}`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shrink-0 shadow-md"
          >
            Resume Attempt &rarr;
          </Link>
        </div>
      )}

      {/* Sprint Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        <Link
          href="/dss/roleplay"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSprint === 0
              ? 'bg-[#45bfae] text-[#0f1214] shadow-md shadow-[#248277]/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          All 12 Workshops
        </Link>
        <Link
          href="/dss/roleplay?sprint=1"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSprint === 1
              ? 'bg-[#45bfae] text-[#0f1214] shadow-md shadow-[#248277]/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Sprint 1: Positioning & Diagnosis (1-3)
        </Link>
        <Link
          href="/dss/roleplay?sprint=2"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSprint === 2
              ? 'bg-[#45bfae] text-[#0f1214] shadow-md shadow-[#248277]/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Sprint 2: Objection Handling (4-6)
        </Link>
        <Link
          href="/dss/roleplay?sprint=3"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSprint === 3
              ? 'bg-[#45bfae] text-[#0f1214] shadow-md shadow-[#248277]/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Sprint 3: High-Value Negotiation (7-9)
        </Link>
        <Link
          href="/dss/roleplay?sprint=4"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSprint === 4
              ? 'bg-[#45bfae] text-[#0f1214] shadow-md shadow-[#248277]/20'
              : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Sprint 4: Closing & Capstone (10-12)
        </Link>
      </div>

      {/* Workshop Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((s) => {
          // Check if learner has completed this scenario before
          const priorAttempt = studentSessions.find((sess) => sess.scenarioId === s.id);
          const latestEval = priorAttempt?.evaluations?.[0];

          return (
            <div
              key={s.id}
              className="bg-[#121c1a] border border-[#248277]/30 hover:border-[#45bfae]/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div>
                {/* Card Top: Workshop Tag + Difficulty */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-md border border-[#248277]/20">
                    {s.isCapstone ? 'Capstone Exam' : `Workshop ${s.workshopNumber || 1}`}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-white/5">
                    {s.difficulty}
                  </span>
                </div>

                {/* Scenario Title */}
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#5cd4c3] transition-colors mb-2">
                  {s.title}
                </h3>

                {/* Persona & Role Info */}
                <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                  <span className="text-[#45bfae] font-medium">{s.targetRole}</span>
                  <span>•</span>
                  <span>{s.channel}</span>
                  <span>•</span>
                  <span>~{s.estimatedMinutes}m</span>
                </div>

                {/* Brief excerpt */}
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed mb-4">
                  {s.studentBrief}
                </p>

                {/* Tested Buyer Persona */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 mb-4 text-[11px] space-y-1">
                  <div className="text-gray-400">
                    <strong className="text-gray-300">Buyer:</strong> {s.buyerPersona.name} ({s.buyerPersona.title})
                  </div>
                  <div className="text-gray-400 truncate">
                    <strong className="text-gray-300">Company:</strong> {s.buyerPersona.company}
                  </div>
                </div>

                {/* Prior Evaluation Result if any */}
                {latestEval && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 mb-4 text-xs">
                    <span className="text-gray-400 font-medium">Previous Result:</span>
                    <span className={`font-bold font-mono ${latestEval.passedThreshold ? 'text-[#45bfae]' : 'text-amber-400'}`}>
                      {latestEval.totalScore}/16 ({latestEval.passedThreshold ? 'PASSED' : 'RETRY SUGGESTED'})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/5 mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-gray-500 font-mono">
                  {s.maxTurns} turns max
                </span>
                <LaunchDrillButton
                  scenarioId={s.id}
                  variant="dss"
                  label={latestEval ? 'Practise Again' : 'Start Simulation'}
                  className="px-4 py-2 text-xs font-bold rounded-xl"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Practice Evidence & Rubric Submissions */}
      {studentSessions.length > 0 && (
        <div className="mt-12 bg-[#0f1214] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae] mb-1">Evidence Portfolio</div>
              <h2 className="text-xl font-serif font-bold text-white">Your Saved Practice Attempts & Feedback</h2>
            </div>
            <Link
              href="/dss/analytics"
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Full Performance Intelligence</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {studentSessions.map((attempt) => {
              const evalResult = attempt.evaluations[0];
              const dateStr = new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(attempt.createdAt));

              return (
                <div key={attempt.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{attempt.scenario.title}</span>
                      <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-white/5">
                        {attempt.mode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{attempt.currentTurnCount} turns recorded</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {evalResult ? (
                      <div className="text-right">
                        <div className={`text-sm font-bold font-mono ${evalResult.passedThreshold ? 'text-[#45bfae]' : 'text-amber-400'}`}>
                          {evalResult.totalScore}/16
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-medium">
                          {evalResult.objectiveOutcome}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md font-medium">
                        In Progress
                      </span>
                    )}

                    <Link
                      href={
                        attempt.status === 'COMPLETED' && evalResult
                          ? `/dss/roleplay/review/${attempt.id}`
                          : `/dss/roleplay/session/${attempt.id}`
                      }
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-semibold text-xs transition-colors border border-white/5"
                    >
                      {attempt.status === 'COMPLETED' ? 'View Feedback & Rubric' : 'Continue'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
