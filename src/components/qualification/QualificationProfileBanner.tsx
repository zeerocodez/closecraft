'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function QualificationProfileBanner({
  qualification,
}: {
  qualification?: any | null;
}) {
  const [dismissed, setDismissed] = useState(false);

  // If already completed or user dismissed, don't show banner
  if (dismissed) return null;
  if (qualification?.status === 'COMPLETED') {
    return (
      <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-on-surface font-medium">
            Qualification Profile: <strong className="text-primary">{qualification.softwareFit?.replace(/_/g, ' ')}</strong>
          </span>
          <span className="text-[11px] text-on-surface-variant font-mono">
            (Evaluated {new Date(qualification.completedAt).toLocaleDateString()})
          </span>
        </div>
        <Link
          href="/onboarding"
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Update Profile</span>
          <Icon name="ArrowRight" size={12} />
        </Link>
      </div>
    );
  }

  // Not completed yet - optional invitation banner
  return (
    <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6 shadow-sm">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon name="Compass" size={18} />
        </div>
        <div>
          <h4 className="font-heading font-semibold text-sm text-on-surface">
            Complete your qualification profile (Optional)
          </h4>
          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
            Tell us about your enquiry flow to unlock tailored follow-up recommendations and assess dedicated sales support options.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface rounded-lg"
        >
          Dismiss
        </button>
        <Link
          href="/onboarding"
          className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
        >
          <span>Start Assessment</span>
          <Icon name="ArrowRight" size={12} />
        </Link>
      </div>
    </div>
  );
}
