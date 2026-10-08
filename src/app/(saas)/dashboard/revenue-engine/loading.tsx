import React from 'react';

export default function RevenueEngineLoading() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full animate-pulse" aria-busy="true" aria-label="Loading Revenue Command Centre">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-surface-container-highest rounded-md"></div>
        <div className="h-4 w-96 bg-surface-container-high rounded-md"></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-6">
          <div className="h-4 w-24 bg-surface-container-highest rounded-md"></div>
          <div className="h-4 w-24 bg-surface-container-high rounded-md"></div>
          <div className="h-4 w-24 bg-surface-container-high rounded-md"></div>
        </div>
        <div className="h-10 w-24 bg-surface-container-highest rounded-md"></div>
      </div>

      <div className="w-full rounded-xl border border-outline-variant/30 bg-surface-container overflow-hidden">
        <div className="h-12 border-b border-outline-variant/30 bg-surface-container-low flex items-center px-4 gap-4">
          <div className="h-4 w-32 bg-surface-container-highest rounded flex-1"></div>
          <div className="h-4 w-16 bg-surface-container-highest rounded"></div>
          <div className="h-4 w-16 bg-surface-container-highest rounded"></div>
          <div className="h-4 w-24 bg-surface-container-highest rounded"></div>
          <div className="h-4 w-48 bg-surface-container-highest rounded flex-1"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 border-b border-outline-variant/30 flex items-center px-4 gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-32 bg-surface-container-highest rounded"></div>
              <div className="h-3 w-24 bg-surface-container-highest rounded"></div>
            </div>
            <div className="h-6 w-24 bg-surface-container-highest rounded-full"></div>
            <div className="h-6 w-24 bg-surface-container-highest rounded-full"></div>
            <div className="h-6 w-24 bg-surface-container-highest rounded-md"></div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 w-full bg-surface-container-highest rounded"></div>
              <div className="h-3 w-3/4 bg-surface-container-highest rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
