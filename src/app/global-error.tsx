'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CloseCraft GlobalError]:', error?.message, 'digest:', error?.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0f1214] border border-white/10 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Temporary Page Load Error</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your workspace data is safe. Reload this page or return to the dashboard to continue.
            </p>
            {error?.message && (
              <p className="text-[11px] font-mono text-amber-300/90 break-words bg-black/40 p-2 rounded-lg border border-white/5">
                {error.message}
              </p>
            )}
            {error?.digest && (
              <p className="text-[11px] font-mono text-gray-500">Reference: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reload Page</span>
            </button>
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs inline-flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
