import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { getPerformanceIntelligenceData } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Performance Intelligence | Closecraft',
  description: 'Evidence-based skill trends, comparable analysis, and review history.',
};

export default async function PerformanceIntelligencePage() {
  const data = await getPerformanceIntelligenceData().catch(() => ({
    trend: {
      status: 'BUILDING_BASELINE' as const,
      totalEligibleAttempts: 0,
      requiredForBaseline: 10,
    },
    attempts: [],
  }));

  const { trend, attempts } = data;
  const isBaseline = trend.status === 'BUILDING_BASELINE';

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
            <span>Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Performance Intelligence
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Auditable evidence, comparable like-with-like trends, and criterion performance history.
          </p>
        </div>

        <Link
          href="/practice/coach"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover transition-colors shadow-sm self-start sm:self-auto"
        >
          <Icon name="Target" size={15} />
          View Active Coach Plan →
        </Link>
      </div>

      {/* Comparable Trend Hero Box */}
      <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Comparable Trend Engine
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Latest 5 vs Preceding 5 Attempts
              </span>
            </div>
            <h2 className="text-lg font-bold text-on-surface mt-1">
              Demonstrated Skill Evolution
            </h2>
          </div>

          <div className="text-xs text-on-surface-variant font-mono">
            Sample size: <strong>{trend.totalEligibleAttempts}</strong> / {trend.requiredForBaseline} attempts
          </div>
        </div>

        {isBaseline ? (
          <div className="p-8 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-high/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Icon name="TrendingUp" size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                Building Your Verified Baseline
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1 leading-relaxed">
                Closecraft does not guess or invent premature trends. A verified comparable trend requires at least 10 eligible attempts under the same rubric version. You currently have {trend.totalEligibleAttempts} recorded attempts.
              </p>
            </div>
            <div className="w-full max-w-xs mx-auto bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (trend.totalEligibleAttempts / trend.requiredForBaseline) * 100)}%` }}
              />
            </div>
            <Link
              href="/practice/scenarios"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover transition-colors"
            >
              Continue Practice ({10 - trend.totalEligibleAttempts} remaining for trend) →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant font-mono">Preceding 5 Avg</span>
                <div className="text-3xl font-extrabold text-on-surface mt-2">
                  {trend.preceding5Average}%
                </div>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant font-mono">Latest 5 Avg</span>
                <div className="text-3xl font-extrabold text-on-surface mt-2">
                  {trend.latest5Average}%
                </div>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant font-mono">Verified Delta</span>
                <div className={`text-3xl font-extrabold mt-2 ${
                  trend.isImproving ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {trend.delta && trend.delta > 0 ? `+${trend.delta}%` : `${trend.delta}%`}
                </div>
              </div>
            </div>

            {/* Accessible Table Breakdown by Criterion */}
            {trend.byCriterion && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-on-surface">
                  Criterion-by-Criterion Like-with-Like Comparison
                </h3>
                <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-high text-on-surface-variant font-mono uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Competency Criterion</th>
                        <th className="py-3 px-4">Preceding 5 (Avg / 2.0)</th>
                        <th className="py-3 px-4">Latest 5 (Avg / 2.0)</th>
                        <th className="py-3 px-4">Net Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                      {trend.byCriterion.map((c) => (
                        <tr key={c.criterionKey} className="hover:bg-surface-container-high/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-on-surface">{c.label}</td>
                          <td className="py-3 px-4 font-mono text-on-surface-variant">{c.precedingAvg}</td>
                          <td className="py-3 px-4 font-mono text-on-surface">{c.latestAvg}</td>
                          <td className={`py-3 px-4 font-mono font-bold ${
                            c.delta > 0 ? 'text-emerald-400' : c.delta < 0 ? 'text-amber-400' : 'text-on-surface-variant'
                          }`}>
                            {c.delta > 0 ? `+${c.delta}` : `${c.delta}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Evaluated Attempts History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Icon name="History" size={20} className="text-primary" />
          Evaluated Practice History
        </h2>

        {attempts.length === 0 ? (
          <div className="p-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
            No completed practice attempts found. Launch your first drill to generate performance intelligence.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high text-on-surface-variant font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {attempts.map((a: any) => (
                  <tr key={a.sessionId} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{a.scenarioTitle}</td>
                    <td className="py-3 px-4 font-mono text-on-surface-variant">
                      {a.workshopNumber ? `WS ${a.workshopNumber}` : 'Drill'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-surface-container-high text-on-surface-variant">
                        {a.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-on-surface">
                      {a.evaluation ? `${a.evaluation.totalScore} / ${a.evaluation.maxPossibleScore} (${a.evaluation.percentage}%)` : 'In Progress'}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono">
                      {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/practice/review/${a.sessionId}`}
                        className="text-primary hover:underline font-semibold"
                      >
                        Inspect Evidence →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
