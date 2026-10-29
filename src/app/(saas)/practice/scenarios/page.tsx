import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { getAuthorisedScenarios } from '@/app/(saas)/practice-actions';

export const metadata = {
  title: 'Scenario Library | Closecraft',
  description: 'Filterable catalog of sales scenarios and drills.',
};

export default async function ScenariosPage({
  searchParams,
}: {
  searchParams: Promise<{
    difficulty?: string;
    workshop?: string;
    role?: string;
    channel?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const workshopNum = params.workshop ? parseInt(params.workshop, 10) : undefined;

  const scenarios = await getAuthorisedScenarios({
    difficulty: params.difficulty,
    workshopNumber: isNaN(workshopNum as any) ? undefined : workshopNum,
    targetRole: params.role,
    channel: params.channel,
    searchQuery: params.q,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <Link href="/practice" className="hover:text-on-surface transition-colors">
              Practice Studio
            </Link>
            <span>/</span>
            <span>Scenario Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Scenario Library
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Select an evidence-based scenario by skill, role, channel, or DSS sprint workshop.
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30 self-start sm:self-auto"
        >
          ← Back to Studio Hub
        </Link>
      </div>

      {/* Filter Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-xs">
        <span className="font-mono text-on-surface-variant uppercase text-[10px] font-bold px-2">
          Filter Difficulty:
        </span>
        {[
          { label: 'All Difficulties', value: '' },
          { label: 'Foundational', value: 'FOUNDATIONAL' },
          { label: 'Intermediate', value: 'INTERMEDIATE' },
          { label: 'Advanced', value: 'ADVANCED' },
          { label: 'Capstone', value: 'CAPSTONE' },
        ].map((f) => {
          const isActive = (!params.difficulty && f.value === '') || params.difficulty === f.value;
          return (
            <Link
              key={f.label}
              href={`/practice/scenarios?${f.value ? `difficulty=${f.value}` : ''}`}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-primary text-primary-contrast font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Scenario Grid */}
      {scenarios.length === 0 ? (
        <div className="p-12 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest text-center space-y-3">
          <Icon name="Compass" size={32} className="mx-auto text-on-surface-variant" />
          <h3 className="text-base font-bold text-on-surface">No scenarios match your filter</h3>
          <p className="text-xs text-on-surface-variant">
            Try adjusting your difficulty or search terms.
          </p>
          <Link
            href="/practice/scenarios"
            className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
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

                <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                  {s.title}
                </h3>

                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                  {s.studentBrief}
                </p>

                <div className="p-3 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 text-[11px] space-y-1">
                  <div className="text-on-surface-variant">
                    <strong>Offer:</strong> {s.approvedOfferFacts.name}
                  </div>
                  <div className="text-on-surface-variant">
                    <strong>Approved Price:</strong> {s.approvedOfferFacts.price}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-mono">
                  ~{s.estimatedMinutes}m • {s.channel}
                </span>

                <Link
                  href={`/practice/session/new?scenarioId=${s.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover font-bold transition-all shadow-sm active:scale-95"
                >
                  <Icon name="Play" size={13} />
                  {s.isCapstone ? 'Start Capstone' : 'Practise'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
