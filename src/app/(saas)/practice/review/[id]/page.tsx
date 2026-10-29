import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { getPracticeAttemptReview } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Attempt Review & Rubric Evaluation | Closecraft',
  description: 'Evidence-based evaluation breakdown and prioritized coaching.',
};

export default async function PracticeAttemptReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let attemptData;
  try {
    attemptData = await getPracticeAttemptReview(id);
  } catch (err) {
    notFound();
  }

  const { session, scenario, turns, latestEvaluation } = attemptData;

  if (!latestEvaluation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 w-16 h-16 mx-auto flex items-center justify-center">
          <Icon name="Clock" size={32} />
        </div>
        <h1 className="text-xl font-bold text-on-surface">Evaluation In Progress or Incomplete</h1>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Your transcript is saved. Click below to re-run or inspect the session.
        </p>
        <Link
          href={`/practice/session/${session.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-contrast font-semibold text-xs"
        >
          Open Session →
        </Link>
      </div>
    );
  }

  const criticalFlags = (typeof latestEvaluation.criticalFlags === 'string'
    ? JSON.parse(latestEvaluation.criticalFlags)
    : latestEvaluation.criticalFlags) || [];

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
            <span>Attempt Review</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface mt-1">
            {scenario.title}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            Evaluated on {new Date(latestEvaluation.createdAt).toLocaleDateString()} • Rubric: {latestEvaluation.rubricVersion}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/practice/session/new?scenarioId=${scenario.id}&parentAttemptId=${session.id}&changedCondition=Price-sensitive%20timeline%20pressure`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Icon name="RotateCcw" size={15} />
            Retry With Changed Condition
          </Link>
        </div>
      </div>

      {/* Critical Flag Alert Banner (If Any) */}
      {criticalFlags.length > 0 && (
        <div className="p-5 rounded-xl border border-red-500/40 bg-red-500/10 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <Icon name="AlertTriangle" size={18} />
            Critical Safety / Policy Flag Detected
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            A critical safety rule was violated during practice. Unresolved critical flags prevent an automatic assessed pass regardless of total score until reviewed by a trainer.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-300 font-mono">
            {criticalFlags.map((flag: any, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span>•</span>
                <span><strong>{flag.type}:</strong> {flag.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Score Summary Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Assessed Score
          </span>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-on-surface tracking-tight">
              {latestEvaluation.totalScore}
            </span>
            <span className="text-sm text-on-surface-variant font-mono">
              / {latestEvaluation.maxPossibleScore} pts ({latestEvaluation.percentage}%)
            </span>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              latestEvaluation.passedThreshold
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <Icon name={latestEvaluation.passedThreshold ? 'Check' : 'AlertCircle'} size={14} />
              {latestEvaluation.passedThreshold ? 'Demonstrated Competence' : 'Development Required'}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Objective Outcome
            </span>
            <p className="text-sm text-on-surface mt-2 leading-relaxed font-medium">
              {latestEvaluation.objectiveOutcome}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant font-mono">
            <div>
              <span className="text-on-surface-variant/70">Evaluator:</span>{' '}
              <strong className="text-on-surface">{latestEvaluation.evaluatorRole}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant/70">Prompt Version:</span>{' '}
              <strong className="text-on-surface">{latestEvaluation.promptVersion}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Feedback & Upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strongest Demonstrated Behaviour */}
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Icon name="CheckCircle" size={18} />
            Strongest Demonstrated Behaviour
          </div>
          <p className="text-xs text-on-surface leading-relaxed">
            {latestEvaluation.strongestBehaviour}
          </p>
        </div>

        {/* Prioritised Correction */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Icon name="Target" size={18} />
            Prioritised Correction
          </div>
          <p className="text-xs text-on-surface leading-relaxed">
            {latestEvaluation.prioritisedCorrection}
          </p>
          {latestEvaluation.evidenceForCorrection && (
            <div className="text-[11px] text-on-surface-variant font-mono pt-1">
              <strong>Evidence:</strong> {latestEvaluation.evidenceForCorrection}
            </div>
          )}
        </div>
      </div>

      {/* Sentence Upgrade / Improved Response Example */}
      {latestEvaluation.improvedResponseExample && (
        <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Icon name="Sparkles" size={18} />
              Model Sentence Upgrade
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Labelled Example
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            A practical rewrite demonstrating clear boundary explanation and confirmation checks:
          </p>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface italic font-serif leading-relaxed">
            {latestEvaluation.improvedResponseExample}
          </div>
        </div>
      )}

      {/* 8-Criterion DSS Rubric Detailed Scorecards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Icon name="ListChecks" size={20} className="text-primary" />
            DSS 8-Criterion Competency Assessment
          </h2>
          <span className="text-xs text-on-surface-variant font-mono">
            {latestEvaluation.criterionScores?.length || 0} criteria assessed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(latestEvaluation.criterionScores || []).map((crit: any) => (
            <div
              key={crit.id}
              className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-on-surface">
                    {crit.criterionLabel}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
                      {crit.score} / 2 pts
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  <p>{crit.reasoning}</p>
                </div>
              </div>

              {crit.observedEvidence && (
                <div className="pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant/80 font-mono">
                  <strong>Observed Evidence:</strong> {crit.observedEvidence}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Log */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-4">
        <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Icon name="MessageSquare" size={18} className="text-primary" />
          Full Conversation Transcript ({turns.length} turns)
        </h2>

        <div className="space-y-3">
          {turns.map((turn: any) => {
            const isStudent = turn.senderType === 'STUDENT';
            return (
              <div
                key={turn.id}
                className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    {isStudent ? 'You (Sales Rep)' : scenario.buyerPersona.name}
                  </span>
                  <span>Turn {turn.turnNumber} • ID: {turn.id}</span>
                </div>
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{turn.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
