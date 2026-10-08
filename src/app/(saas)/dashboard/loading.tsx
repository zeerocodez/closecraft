import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-surface-container-highest rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-surface-container-high rounded-md"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-surface-container-highest rounded-md"></div>
          <div className="h-10 w-32 bg-surface-container-highest rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 md:p-6 flex flex-col gap-4 bg-surface-container rounded-xl border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div className="h-4 w-24 bg-surface-container-highest rounded-md"></div>
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest"></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-32 bg-surface-container-highest rounded-md"></div>
              <div className="h-3 w-40 bg-surface-container-highest rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container border border-outline-variant/30 rounded-xl p-6 h-[400px]">
          <div className="h-6 w-48 bg-surface-container-highest rounded-md mb-6"></div>
          <div className="w-full h-full bg-surface-container-highest/50 rounded-lg"></div>
        </div>
        
        <div className="lg:col-span-4 bg-surface-container border border-outline-variant/30 rounded-xl p-6 h-[400px]">
          <div className="h-6 w-32 bg-surface-container-highest rounded-md mb-6"></div>
          <div className="w-full h-full bg-surface-container-highest/50 rounded-full max-w-[200px] max-h-[200px] mx-auto mt-8"></div>
        </div>
      </div>
    </div>
  );
}
