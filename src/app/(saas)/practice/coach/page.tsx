import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { getCoachPlanData } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Coach Plan | Closecraft',
  description: 'Evidence-driven next practice priorities and assigned drills.',
};

export default async function CoachPlanPage() {
  const coachData = await getCoachPlanData().catch(() => ({
    recommendation: null,
    dueAssignments: [],
    unfinishedSession: null,
  }));

  const { recommendation, dueAssignments, unfinishedSession } = coachData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <Link href="/practice" className="hover:text-on-surface transition-colors">
              Practice Studio
            </Link>
            <span>/</span>
            <span>Coach Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Coach Plan
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Prescriptive next exercises derived strictly from observed practice evidence and trainer assignments.
          </p>
        </div>

        <Link
          href="/practice/intelligence"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30 self-start sm:self-auto"
        >
          <Icon name="TrendingUp" size={15} />
          Inspect Evidence Trends →
        </Link>
      </div>

      {/* Main Focus Card */}
      {recommendation ? (
        <div className="rounded-2xl border border-primary/30 bg-surface-container-lowest p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                <Icon name="Target" size={13} />
                Active Development Focus
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Selection Rule: 3-of-5 Gap Analysis
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
                Priority: {recommendation.targetSkill}
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {recommendation.plainReason}
              </p>
            </div>

            {/* Triggering Evidence Box */}
            {recommendation.triggeringEvidence && (
              <div className="p-4 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 text-xs space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                  Triggering Evidence Log
                </span>
                <p className="text-on-surface font-mono text-[11px] leading-relaxed">
                  Source: {(recommendation.triggeringEvidence as any).source || 'Assessed Practice Session Transcripts'}
                  {(recommendation.triggeringEvidence as any).sampleEvidence && (
                    <span> • Observed friction: "{(recommendation.triggeringEvidence as any).sampleEvidence}"</span>
                  )}
                </p>
              </div>
            )}

            {recommendation.suggestedScenario && (
              <div className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-high/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-highest text-on-surface">
                      {recommendation.suggestedScenario.difficulty}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      ~{recommendation.suggestedScenario.estimatedMinutes} mins • {recommendation.suggestedScenario.channel}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface mt-1">
                    {recommendation.suggestedScenario.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {recommendation.suggestedScenario.learningObjective}
                  </p>
                </div>

                <Link
                  href={`/practice/session/new?scenarioId=${recommendation.suggestedScenario.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover font-bold text-xs shrink-0 shadow-sm transition-all active:scale-95"
                >
                  <Icon name="Play" size={15} />
                  Start Exercise Now
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
          Complete a practice drill to generate your tailored coach recommendation.
        </div>
      )}

      {/* Due Assignments */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Icon name="CalendarCheck" size={20} className="text-primary" />
          Scheduled & Cohort Assignments
        </h2>

        {dueAssignments.length === 0 ? (
          <div className="p-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
            No pending trainer assignments due at this time. All regular drills remain open for self-paced practice.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
