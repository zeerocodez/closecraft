import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Icon } from '@/components/ui/Icon';
import { issueCredentialAction } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Readiness Review & Capstone | Closecraft',
  description: 'Assessed capstone demonstrations, reviewer decisions, and verifiable credentials.',
};

export default async function ReadinessReviewPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = (session as any)?.role || 'USER';
  const isTrainerOrOperator = ['ADMIN', 'SUPER_ADMIN', 'OPERATOR', 'MANAGER'].includes(userRole);

  // Fetch Capstone Scenario
  const capstoneScenario = await prisma.practiceScenario.findFirst({
    where: { isCapstone: true },
  });

  // Fetch User's Capstone attempts
  const userCapstoneAttempts = userId
    ? await prisma.practiceSession.findMany({
        where: {
          userId,
          scenario: { isCapstone: true },
          status: 'COMPLETED',
        },
        include: {
          scenario: true,
          evaluations: {
            where: { state: 'COMPLETED' },
            orderBy: { evaluationVersion: 'desc' },
            take: 1,
            include: { credentials: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // Fetch User's Credentials
  const userCredentials = userId
    ? await prisma.verifiableCredential.findMany({
        where: { userId },
        include: {
          reviewer: { select: { name: true } },
        },
        orderBy: { issuedAt: 'desc' },
      })
    : [];

  // If trainer or operator, fetch submissions waiting for review
  const pendingReviewQueue = isTrainerOrOperator
    ? await prisma.practiceEvaluation.findMany({
        where: {
          reviewerDecision: null,
          session: {
            mode: 'CAPSTONE',
          },
        },
        include: {
          session: {
            include: {
              user: { select: { name: true, email: true } },
              scenario: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <Link href="/practice" className="hover:text-on-surface transition-colors">
              Practice Studio
            </Link>
            <span>/</span>
            <span>Readiness Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Readiness Review & Capstone
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Assessed practical demonstrations, human reviewer decisions, and tamper-evident competency credentials.
          </p>
        </div>

        {capstoneScenario && (
          <Link
            href={`/practice/session/new?scenarioId=${capstoneScenario.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
          >
            <Icon name="Award" size={16} />
            Launch Capstone Assessment
          </Link>
        )}
      </div>

      {/* Capstone Benchmark Standards Notice */}
      <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest space-y-4">
        <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Icon name="ShieldCheck" size={20} className="text-amber-400" />
          DSS Practical Readiness Benchmark
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
            <span className="font-mono text-on-surface-variant uppercase text-[10px] font-bold">Passing Threshold</span>
            <div className="text-xl font-bold text-on-surface">≥ 12 of 16 Points</div>
            <p className="text-on-surface-variant mt-1">
              Requires 75%+ across all 8 criteria of the integrated DSS rubric.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
            <span className="font-mono text-on-surface-variant uppercase text-[10px] font-bold">Safety Compliance</span>
            <div className="text-xl font-bold text-emerald-400">Zero Critical Flags</div>
            <p className="text-on-surface-variant mt-1">
              No unapproved guarantees, fabricated evidence, or data leaks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 space-y-1">
            <span className="font-mono text-on-surface-variant uppercase text-[10px] font-bold">Reviewer Authority</span>
            <div className="text-xl font-bold text-primary">Human Certified</div>
            <p className="text-on-surface-variant mt-1">
              AI evaluates preliminary evidence; an authorised reviewer confirms issuance.
            </p>
          </div>
        </div>
      </div>

      {/* Verifiable Credentials Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Icon name="Award" size={20} className="text-amber-400" />
          Verified Competency Records
        </h2>

        {userCredentials.length === 0 ? (
          <div className="p-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
            No verified credentials issued yet. Complete the Integrated Capstone (≥12/16) and request trainer review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCredentials.map((cred) => (
              <div
                key={cred.id}
                className="p-6 rounded-2xl border border-amber-500/40 bg-surface-container-lowest flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      {cred.uniqueCode}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {cred.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-on-surface mt-2">
                    {cred.trackTitle}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Verified Score: <strong>{cred.verifiedScore} / 16</strong> • Rubric: {cred.criterionVersion}
                  </p>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-mono">
                    Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/dss/verify/${cred.uniqueCode}`}
                    target="_blank"
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    Public Verification Link ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User's Capstone Demonstrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Icon name="CheckSquare" size={20} className="text-primary" />
          Your Assessed Capstone Demonstrations
        </h2>

        {userCapstoneAttempts.length === 0 ? (
          <div className="p-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
            You haven't completed an integrated capstone attempt yet.
          </div>
        ) : (
          <div className="space-y-3">
            {userCapstoneAttempts.map((attempt) => {
              const evalObj = attempt.evaluations[0];
              const isEligibleForCredential =
                evalObj &&
                evalObj.totalScore >= 12 &&
                !evalObj.hasUnresolvedCriticalFlag &&
                evalObj.credentials.length === 0;

              return (
                <div
                  key={attempt.id}
                  className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">
                        {attempt.scenario.title}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {evalObj && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        Score: <strong>{evalObj.totalScore} / {evalObj.maxPossibleScore}</strong> ({evalObj.percentage}%) • Outcome: {evalObj.objectiveOutcome}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/practice/review/${attempt.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                    >
                      View Breakdown
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trainer Review Queue (Visible to Trainers/Operators) */}
      {isTrainerOrOperator && (
        <div className="space-y-4 pt-6 border-t border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Icon name="Users" size={20} className="text-primary" />
                Trainer Review Queue
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Assessed capstone attempts awaiting human trainer audit, feedback review, and credential decisions.
              </p>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">
              {pendingReviewQueue.length} pending
            </span>
          </div>

          {pendingReviewQueue.length === 0 ? (
            <div className="p-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
              Review queue is clear. No unreviewed capstones awaiting decisions.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">
                        {item.session.user?.name || item.session.user?.email}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        {item.session.scenario?.title}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Preliminary Score: <strong>{item.totalScore} / {item.maxPossibleScore}</strong> • Submitted: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/practice/review/${item.sessionId}`}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover transition-colors shrink-0"
                  >
                    Inspect & Decide →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
