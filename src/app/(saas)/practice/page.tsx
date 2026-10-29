import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { getCoachPlanData, getLearnerProfile, getAuthorisedScenarios } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Practice Studio | Closecraft',
  description: 'Evidence-based sales practice, drills, and performance coaching.',
};

export default async function PracticeStudioPage() {
  const [coachData, profile, scenarios] = await Promise.all([
    getCoachPlanData().catch(() => ({ recommendation: null, dueAssignments: [], unfinishedSession: null })),
    getLearnerProfile().catch(() => null),
    getAuthorisedScenarios().catch(() => []),
  ]);

  const { recommendation, dueAssignments, unfinishedSession } = coachData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Adaptive Sales Enablement
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              DSS Sprint Engine v2026.1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-2">
            Practice Studio
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Turn evidence into closing competence through realistic buyer simulations, deliberate drills, and verified feedback.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/practice/coach"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            <Icon name="Target" size={16} className="text-primary" />
            Coach Plan
          </Link>
          <Link
            href="/practice/intelligence"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            <Icon name="TrendingUp" size={16} className="text-emerald-400" />
            Performance Intelligence
          </Link>
          <Link
            href="/practice/readiness"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            <Icon name="Award" size={16} className="text-amber-400" />
            Readiness & Capstone
          </Link>
          <Link
            href="/practice/scenarios"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Icon name="Compass" size={16} />
            All Scenarios
          </Link>
        </div>
      </div>

      {/* Onboarding Notice if Profile is empty */}
      {!profile && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Icon name="Sparkles" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Personalize Your Practice Routine</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Set your target role (Setter vs Closer), weekly practice time, and core development priority to sharpen automated feedback.
              </p>
            </div>
          </div>
          <Link
            href="/practice/onboarding"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover shrink-0 self-start sm:self-auto transition-colors"
          >
            Configure Goal & Routine →
          </Link>
        </div>
      )}

      {/* Unfinished Session Alert (Resume) */}
      {unfinishedSession && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Icon name="RotateCcw" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Unfinished Session
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  Turn {unfinishedSession.currentTurnCount} of {unfinishedSession.maxTurns}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-on-surface mt-1">
                {unfinishedSession.scenarioTitle}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Your prior turns and buyer states are saved. Resume whenever you are ready.
              </p>
            </div>
          </div>
          <Link
            href={`/practice/session/${unfinishedSession.id}`}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 shrink-0 self-start sm:self-auto transition-colors font-medium"
          >
            Resume Practice →
          </Link>
        </div>
      )}

      {/* Next Best Action / Coach Recommendation Banner */}
      {recommendation && recommendation.suggestedScenario && (
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  <Icon name="Target" size={12} />
                  Next Best Move
                </span>
                <span className="text-xs text-on-surface-variant">
                  Target Competency: <strong className="text-on-surface">{recommendation.targetSkill}</strong>
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {recommendation.suggestedScenario.title}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  {recommendation.plainReason}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <Icon name="Clock" size={14} className="text-on-surface-variant" />
                  ~{recommendation.suggestedScenario.estimatedMinutes} mins
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="MessageSquare" size={14} className="text-on-surface-variant" />
                  Max {recommendation.suggestedScenario.maxTurns} turns
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="Layers" size={14} className="text-on-surface-variant" />
                  {recommendation.suggestedScenario.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <Link
                href={`/practice/session/new?scenarioId=${recommendation.suggestedScenario.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <Icon name="Play" size={16} />
                Start This Exercise
              </Link>
              <Link
                href="/practice/coach"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Inspect Evidence Behind Recommendation →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Due Assignments (If Any) */}
      {dueAssignments && dueAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Icon name="FileCheck2" size={18} className="text-primary" />
              Assigned Work Due For Review
            </h2>
            <span className="text-xs text-on-surface-variant font-mono">
              {dueAssignments.length} pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueAssignments.map((a: any) => (
              <div
                key={a.id}
                className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      Assigned by {a.assignedBy}
                    </span>
                    {a.dueDate && (
                      <span className="text-xs text-amber-400 font-mono">
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-on-surface mt-2">{a.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                    {a.scenario?.studentBrief}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant font-mono">
                    {a.scenario?.estimatedMinutes}m drill
                  </span>
                  <Link
                    href={`/practice/session/new?scenarioId=${a.scenario?.id}&assignmentId=${a.id}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Start Assignment →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DSS 4-Week Sprint Workshop Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Icon name="BookOpen" size={20} className="text-primary" />
              DSS 4-Week Sprint Curriculum (12 Workshops)
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Practice drills connected directly to weekly Digital Sales School modules and trainer oversight.
            </p>
          </div>
          <Link
            href="/practice/scenarios"
            className="text-xs text-primary hover:underline font-semibold"
          >
            View Filterable Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.slice(0, 12).map((s: any) => (
            <div
              key={s.id}
              className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/30 font-mono">
                    {s.workshopNumber ? `WS ${s.workshopNumber}` : 'DRILL'}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    s.isCapstone 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {s.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                  {s.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                  {s.studentBrief}
                </p>

                {s.workshopTitle && (
                  <p className="text-[11px] text-on-surface-variant/80 mt-2 font-mono line-clamp-1">
                    Lesson: {s.workshopTitle}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {s.estimatedMinutes}m • {s.channel}
                </span>
                <Link
                  href={`/practice/session/new?scenarioId=${s.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  {s.isCapstone ? 'Take Capstone' : 'Practise'} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Aware Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Link
          href="/practice/intelligence"
          className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-emerald-500/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Icon name="TrendingUp" size={20} />
          </div>
          <h3 className="text-sm font-bold text-on-surface group-hover:text-emerald-400 transition-colors">
            Performance Intelligence
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Track like-with-like progress (comparing latest 5 vs preceding 5 attempts) and inspect assessed evidence.
          </p>
        </Link>

        <Link
          href="/practice/readiness"
          className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-amber-500/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Icon name="Award" size={20} />
          </div>
          <h3 className="text-sm font-bold text-on-surface group-hover:text-amber-400 transition-colors">
            Readiness Review
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Submit integrated capstones (≥12/16 threshold), request trainer review, and generate verifiable credentials.
          </p>
        </Link>

        <Link
          href="/practice/playbooks"
          className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Icon name="BookOpen" size={20} />
          </div>
          <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            Sales Playbooks & CRM Prep
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Upload company playbooks or rehearse active CRM opportunities before high-stakes buyer conversations.
          </p>
        </Link>
      </div>
    </div>
  );
}
