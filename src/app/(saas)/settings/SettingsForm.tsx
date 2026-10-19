"use client";

import React, { useState } from 'react';
import { updateQualificationPolicy } from '@/app/(saas)/actions';

const TEMPLATES = [
  {
    name: 'B2B Enterprise & Managed Closers (₦500k+)',
    text: `A lead is QUALIFIED ONLY if:
1. Budget is at least ₦500,000 (or $1,000+).
2. Decision-maker is a Founder, Director, CEO, or VP.
3. Need is enterprise sales outsourcing, closer staffing, or revenue engine deployment.
4. Purchase timeline is within 60 days.

DISQUALIFICATION RULES:
- If budget is below ₦500,000, or prospect is an individual job seeker/student, mark as DISQUALIFIED / LOW FIT.
- Route disqualified leads to AUTOMATION (5-step educational nurture sequence).
- High urgency leads (<30 days) that meet criteria must immediately trigger ASSIGN_HUMAN with 15m SLA.`
  },
  {
    name: 'Digital Sales School (DSS) Academy (₦100k - ₦150k / $100 - $150)',
    text: `A lead is QUALIFIED if:
1. Prospect is an aspiring sales closer, setter, freelancer, career switcher, or B2B founder.
2. Budget is at least ₦100,000 / $100 for single route (Setters, Closers, Live Roleplays/Internship) or ₦150,000 / $150 for Both Routes bundle.
3. Seeking enrollment in the upcoming cohort tracks.
4. Shows clear motivation and time commitment for live practice and roleplay sessions.

DISQUALIFICATION RULES:
- If budget is strictly below ₦100,000 / $100, route to AUTOMATION for tuition installment/sample lesson guide.
- Qualified applicants should receive SEND_BOOKING_LINK for admissions diagnostic.`
  }
];

export function SettingsForm({ initialPolicy }: { initialPolicy: string }) {
  const [policy, setPolicy] = useState(initialPolicy || "");
  const [reprocess, setReprocess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateQualificationPolicy(policy, reprocess);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold text-on-surface mb-1">
          Ideal Customer Profile (ICP) &amp; Qualification Policy
        </label>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          Define what makes an inbound lead "Qualified" for your business. The AI Revenue Engine strictly incorporates this policy when calculating Intent, Fit, and setting the Next Best Action for every lead.
        </p>

        {/* 1-Click Templates */}
        <div className="mb-3">
          <span className="text-xs font-semibold text-on-surface-variant block mb-2">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPolicy(t.text)}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>

        <textarea 
          required 
          name="policy" 
          value={policy} 
          onChange={(e) => setPolicy(e.target.value)}
          rows={11}
          className="w-full p-4 bg-surface-container-low border border-surface-container rounded-xl text-on-surface focus:outline-none focus:border-primary text-xs md:text-sm font-mono leading-relaxed"
          placeholder="e.g. A qualified lead must be a B2B SaaS company with >₦500k budget. If they mention urgency, assign them to a HUMAN immediately..."
        />
      </div>

      {/* Reprocess Option */}
      <div className="p-3 bg-surface-container-low border border-surface-container rounded-lg flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
          <input
            type="checkbox"
            checked={reprocess}
            onChange={(e) => setReprocess(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
          />
          <span>Immediately re-score and re-evaluate all existing leads with this policy</span>
        </label>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          type="submit" 
          disabled={loading} 
          className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Saving & Re-evaluating...' : 'Save & Activate AI Policy'}
        </button>
        {success && (
          <span className="text-primary text-xs font-bold flex items-center gap-1 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Policy updated &amp; Revenue Engine synchronized!
          </span>
        )}
      </div>
    </form>
  );
}
