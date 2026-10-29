'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlayCircle, ArrowRight } from 'lucide-react';
import { startPracticeSession } from '@/app/(saas)/practice-actions';

interface LaunchDrillButtonProps {
  scenarioId: string;
  parentAttemptId?: string;
  changedCondition?: string;
  assignmentId?: string;
  lessonId?: string;
  moduleId?: string;
  variant?: 'saas' | 'dss';
  className?: string;
  label?: string;
}

export default function LaunchDrillButton({
  scenarioId,
  parentAttemptId,
  changedCondition,
  assignmentId,
  lessonId,
  moduleId,
  variant = 'saas',
  className = '',
  label = 'Launch Practice Drill',
}: LaunchDrillButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetHref = variant === 'dss'
    ? `/dss/roleplay/session/new?scenarioId=${scenarioId}${assignmentId ? `&assignmentId=${assignmentId}` : ''}${lessonId ? `&lessonId=${lessonId}` : ''}${moduleId ? `&moduleId=${moduleId}` : ''}`
    : `/practice/session/new?scenarioId=${scenarioId}${parentAttemptId ? `&parentAttemptId=${parentAttemptId}` : ''}${changedCondition ? `&changedCondition=${encodeURIComponent(changedCondition)}` : ''}${assignmentId ? `&assignmentId=${assignmentId}` : ''}`;

  const handleLaunch = async (e: React.MouseEvent) => {
    // If command or control key is pressed (opening in new tab), let default browser link handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await startPracticeSession({
        scenarioId,
        parentAttemptId,
        changedCondition,
        assignmentId,
      });

      if (res?.sessionId) {
        if (variant === 'dss') {
          router.push(`/dss/roleplay/session/${res.sessionId}${lessonId ? `?lessonId=${lessonId}` : ''}`);
        } else {
          router.push(`/practice/session/${res.sessionId}`);
        }
      } else {
        router.push(targetHref);
      }
    } catch (err: any) {
      console.error('Failed to launch drill:', err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('sign in')) {
        const callbackUrl = encodeURIComponent(targetHref);
        router.push(`/login?callbackUrl=${callbackUrl}`);
      } else {
        setError(err.message || 'Failed to start practice simulation');
        setLoading(false);
      }
    }
  };

  const baseStyles = variant === 'dss'
    ? 'bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold shadow-md shadow-[#248277]/20 border border-[#45bfae]/30'
    : 'bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm';

  return (
    <div className="inline-flex flex-col">
      <a
        href={targetHref}
        onClick={handleLaunch}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${baseStyles} ${loading ? 'opacity-75 cursor-wait' : ''} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Starting Simulation...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ArrowRight size={16} />
          </>
        )}
      </a>
      {error && (
        <span className="text-xs text-rose-500 mt-1">{error}</span>
      )}
    </div>
  );
}
