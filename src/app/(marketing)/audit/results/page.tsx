import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import DiagnosticScorecardClient from '@/components/tools/DiagnosticScorecardClient';

export const metadata: Metadata = {
  title: 'Follow-Up Health Scorecard — CloseCraft HQ',
  description: 'Your personalized follow-up diagnostic scorecard. Pinpoint revenue lost to response delay, unassigned callbacks, and sales pipeline friction.',
  openGraph: {
    title: 'Follow-Up Health Scorecard — CloseCraft HQ',
    description: 'Pinpoint revenue lost to response delay, unassigned callbacks, and sales pipeline friction.',
    url: 'https://www.closecrafthq.com/audit/results',
    type: 'website',
  },
};

export default function AuditResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#248277] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-400">Loading your follow-up scorecard...</span>
        </div>
      </div>
    }>
      <DiagnosticScorecardClient />
    </Suspense>
  );
}

