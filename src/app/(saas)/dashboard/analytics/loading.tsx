import React from 'react';

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full animate-pulse" aria-busy="true" aria-label="Loading Revenue Analytics">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-surface-container-highest rounded-md mb-2"></div>
          <div className="h-4 w-96 bg-surface-container-high rounded-md"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-surface-container-highest rounded-md"></div>
          <div className="h-10 w-32 bg-surface-container-highest rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant/30 rounded-xl p-6 h-[400px]">
          <div className="h-6 w-64 bg-surface-container-highest rounded-md mb-6"></div>
          <div className="w-full h-full bg-surface-container-highest/50 rounded-lg"></div>
        </div>

        <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-6 h-[400px]">
          <div className="h-6 w-48 bg-surface-container-highest rounded-md mx-auto mb-10 mt-6"></div>
          <div className="w-full h-full max-w-[240px] max-h-[240px] bg-surface-container-highest/50 rounded-full mx-auto"></div>
        </div>

        <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-6 h-[400px]">
          <div className="h-6 w-48 bg-surface-container-highest rounded-md mx-auto mb-10 mt-6"></div>
          <div className="w-full h-full max-w-[240px] max-h-[240px] bg-surface-container-highest/50 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
