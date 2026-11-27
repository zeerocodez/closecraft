'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function SaasErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CloseCraft SaaS ErrorBoundary]:', error?.message, 'digest:', error?.digest);
  }, [error]);

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#0f1214] border border-white/10 text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Temporary Workspace Load Issue</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your workspace data is safe. A temporary server or database timeout interrupted loading this view.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-gray-500">Reference: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent-lime hover:bg-accent-lime-soft text-[#111827] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reload View</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs inline-flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={14} />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
