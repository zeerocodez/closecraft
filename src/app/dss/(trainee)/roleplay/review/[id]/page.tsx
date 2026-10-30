import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';
import { getPracticeAttemptReview, submitForTrainerReview } from '@/app/(saas)/practice-actions';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: 'Practice Attempt Review & Rubric | Digital Sales School',
  description: 'Evidence-based rubric scoring, transcript quotes, and coaching upgrades.',
};

export default async function DSSPracticeReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    returnUrl?: string;
  }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const returnUrl = sParams?.returnUrl;

  let attemptData;
  try {
    attemptData = await getPracticeAttemptReview(id);
  } catch (err) {
    notFound();
  }

  const { session, scenario, turns, latestEvaluation } = attemptData;

  if (!latestEvaluation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 w-16 h-16 mx-auto flex items-center justify-center">
          <Sparkles size={32} />
        </div>
        <h1 className="text-xl font-bold text-white">Evaluation In Progress</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Your transcript is saved. Click below to continue or review the session.
        </p>
        <Link
          href={`/dss/roleplay/session/${session.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#45bfae] text-[#0f1214] font-bold text-xs"
        >
          Open Session &rarr;
        </Link>
      </div>
    );
  }

  const evalData = latestEvaluation as any;

  const criticalFlags = (typeof evalData?.criticalFlags === 'string'
    ? JSON.parse(evalData.criticalFlags)
    : evalData?.criticalFlags) || [];

  const sentenceUpgrades = evalData?.improvedResponseExample
    ? [{ 
        rubricFocus: 'Communication Polish', 
        originalText: evalData.evidenceForCorrection || 'Your turn response', 
        recommendedAlternative: evalData.improvedResponseExample, 
        reason: evalData.prioritisedCorrection || 'Align with commercial guardrails' 
      }]
    : [];

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
      {/* Top Navigation & Return to Lesson Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Link href="/dss/roleplay" className="hover:text-white transition-colors">
              DSS Practice Studio
            </Link>
            <span>/</span>
            <span>Attempt Review</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mt-1">
            {scenario.title}
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Evaluated on {new Date(evalData.createdAt).toLocaleDateString()} • Rubric: {evalData.rubricVersion}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {returnUrl && (
            <Link
              href={returnUrl}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10 shadow-sm"
            >
              <ArrowLeft size={14} />
              Return to Lesson
            </Link>
          )}

          <Link
            href={`/dss/roleplay/session/new?scenarioId=${scenario.id}&parentAttemptId=${session.id}&changedCondition=Price-sensitive%20timeline%20pressure${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] transition-colors shadow-sm"
          >
            <RotateCcw size={14} />
            Practise Again (Preserve History)
          </Link>
        </div>
      </div>

      {/* AI Practice Feedback Badge & Evidence Provenance */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#248277]/20 text-[#45bfae] font-bold tracking-wide uppercase text-[11px] border border-[#248277]/40 flex items-center gap-1.5">
            <Sparkles size={13} />
            AI Practice Feedback
          </span>
          <span className="text-gray-400">
            • Evaluator Model: Server-Controlled Rubric Engine
          </span>
          {session.isAssisted && (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
              Assisted Attempt ({session.hintsUsed || 1} {session.hintsUsed === 1 ? 'hint' : 'hints'} used)
            </span>
          )}
        </div>
        {session.evidenceHash && (
          <div className="text-[11px] text-gray-500 font-mono" title={`SHA-256 Evidence Hash: ${session.evidenceHash}`}>
            Evidence Hash: {session.evidenceHash.substring(0, 12)}...
          </div>
        )}
      </div>

      {/* Critical Flag Alert Banner (If Any) */}
      {criticalFlags.length > 0 && (
        <div className="p-5 rounded-2xl border border-red-500/40 bg-red-500/10 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle size={18} />
            Critical Safety / Policy Flag Detected
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            A critical policy was triggered during simulation. Unresolved critical flags require faculty review before certification credits can be awarded.
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

      {/* Score & Readiness Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Score */}
        <div className="p-6 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Rubric Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-white">{evalData.totalScore}</span>
            <span className="text-sm text-gray-400 font-mono">/ {evalData.maxPossibleScore || 16} pts ({evalData.percentage || 0}%)</span>
          </div>
          <div className="pt-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              evalData.passedThreshold 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {evalData.passedThreshold ? <CheckCircle2 size={13} /> : <RotateCcw size={13} />}
              {evalData.passedThreshold ? 'Demonstrated Competence' : 'Target Threshold (>= 75%)'}
            </span>
          </div>
        </div>

        {/* Readiness Tier */}
        <div className="p-6 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae]">Demonstrated Tier</div>
          <div className="text-2xl font-serif font-bold text-white">{evalData.objectiveOutcome}</div>
          <p className="text-xs text-gray-400">
            {evalData.strongestBehaviour || 'Demonstrated foundational sales process adherence.'}
          </p>
        </div>

        {/* Trainer Submission Card */}
        <div className="p-6 rounded-2xl bg-[#121c1a] border border-[#248277]/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae] mb-1">Trainer Submission</div>
            <div className="text-sm font-bold text-white">DSS Faculty Portfolio</div>
            <p className="text-xs text-gray-400 mt-1">
              Submit this verified attempt to your DSS cohort trainer for portfolio review and credential verification.
            </p>
          </div>
          <form 
            action={async () => {
              'use server';
              await submitForTrainerReview(session.id);
            }} 
            className="pt-3"
          >
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#248277] hover:bg-[#2e9c8f] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#248277]/20"
            >
              <Send size={14} />
              Submit to Trainer Portfolio
            </button>
          </form>
        </div>
      </div>

      {/* Submitted Handoff Notes (If Any) */}
      {session.submittedNotes && (
        <div className="p-5 rounded-2xl bg-[#121c1a] border border-[#248277]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45bfae] flex items-center gap-2">
              <BookOpen size={14} />
              Submitted Handoff Note & CRM Opportunity Summary
            </span>
            <span className="text-[11px] text-gray-400 font-mono">Assessed Artifact</span>
          </div>
          <blockquote className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-mono">
            {session.submittedNotes}
          </blockquote>
        </div>
      )}

      {/* Executive Feedback */}
      <div className="p-6 rounded-2xl bg-[#0f1214] border border-white/5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#45bfae] flex items-center gap-2">
          <Sparkles size={14} />
          Executive Coaching Assessment
        </h3>
        <p className="text-sm text-gray-200 leading-relaxed font-sans">
          {evalData.prioritisedCorrection || evalData.strongestBehaviour || 'Attempt completed and recorded.'}
        </p>
      </div>

      {/* 8-Criterion Rubric Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae] mb-0.5">8-Criterion DSS Rubric</div>
            <h2 className="text-xl font-serif font-bold text-white">Criterion Scorecard & Evidence</h2>
          </div>
          <span className="text-xs text-gray-500 font-mono">0 = Absent • 1 = Partial • 2 = Mastered</span>
        </div>

        <div className="space-y-3">
          {latestEvaluation.criterionScores?.map((cs: any) => {
            const isNotAssessed = cs.assessmentStatus === 'not_assessed' || cs.score === null;
            const scoreColor = isNotAssessed
              ? 'text-gray-400 border-white/10 bg-white/5'
              : cs.score === 2 
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : cs.score === 1
              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

            return (
              <div 
                key={cs.id}
                className="p-5 rounded-2xl bg-[#121c1a] border border-[#248277]/20 hover:border-[#248277]/40 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white">
                      {cs.criterionLabel || cs.criterionName || cs.criterionKey}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {cs.reasoning || cs.rationale}
                    </p>
                    {cs.omissionReason && (
                      <p className="text-xs text-amber-300/90 mt-1 italic">
                        Omission Finding: {cs.omissionReason}
                      </p>
                    )}
                    {isNotAssessed && cs.notAssessedReason && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        Not Assessed: {cs.notAssessedReason}
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-xl border font-mono font-bold text-xs shrink-0 ${scoreColor}`}>
                    {isNotAssessed ? 'NOT ASSESSED' : `${cs.score} / 2`}
                  </div>
                </div>

                {/* Evidence Quote from student */}
                {(cs.observedEvidence || cs.evidenceQuote) && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#45bfae] block mb-1">
                      Cited Evidence:
                    </span>
                    <blockquote className="italic border-l-2 border-[#45bfae] pl-3 py-0.5 text-gray-300">
                      "{cs.observedEvidence || cs.evidenceQuote}"
                    </blockquote>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentence Upgrades */}
      {sentenceUpgrades.length > 0 && (
        <div className="space-y-4 pt-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#45bfae] mb-0.5">High-Ticket Polish</div>
            <h2 className="text-xl font-serif font-bold text-white">Recommended Sentence Upgrades</h2>
          </div>

          <div className="space-y-3">
            {sentenceUpgrades.map((upgrade: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#121c1a] border border-[#248277]/30 space-y-3">
                <div className="text-xs font-mono text-gray-400">Focus: {upgrade.rubricFocus}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">What you said:</span>
                    <p className="text-rose-200 italic">"{upgrade.originalText}"</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">High-Impact Alternative:</span>
                    <p className="text-emerald-200 font-medium">"{upgrade.recommendedAlternative}"</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">Reason: {upgrade.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engine Attribution Footer */}
      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          <Logo variant="icon" size="xs" />
          <span>Powered by <strong>Closecraft Performance Intelligence</strong></span>
        </div>
        <div>
          <span>Attempt ID: {session.id.substring(0, 12)}...</span>
        </div>
      </div>
    </div>
  );
}
