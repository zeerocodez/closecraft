"use client";

import React, { useState } from 'react';
import { updateQualificationPolicy } from '@/app/(saas)/actions';
import { Sparkles, BrainCircuit, CheckCircle2, Save, FileText, RefreshCw, Loader2 } from 'lucide-react';

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
    name: 'Digital Sales School (DSS) Academy (₦100k - ₦150k)',
    text: `A lead is QUALIFIED if:
1. Prospect is an aspiring sales closer, setter, freelancer, career switcher, or B2B founder.
2. Budget is at least ₦100,000 / $100 for single route (Setters, Closers, Live Roleplays/Internship) or ₦150,000 / $150 for Both Routes bundle.
3. Seeking enrollment in the upcoming cohort tracks.
4. Shows clear motivation and time commitment for live practice and roleplay sessions.

DISQUALIFICATION RULES:
- If budget is strictly below ₦100,000 / $100, route to AUTOMATION for tuition installment/sample lesson guide.
- Qualified applicants should receive SEND_BOOKING_LINK for admissions diagnostic.`
  },
  {
    name: 'Growth Services & Creative Studio (₦150k+)',
    text: `A lead is QUALIFIED if:
1. Prospect requires 1 or more of the 5 Growth Services (Meta Ads, AI Flyer, AI Video, Landing Page, VSL).
2. Active business with product-market fit or validated commercial offer.
3. Monthly marketing budget exceeding ₦150,000.

DISQUALIFICATION RULES:
- Inquiries without clear business context or sub-₦50,000 budget should receive service rate card via WhatsApp automated nurture.`
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>AI qualification policy updated successfully.</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit size={16} className="text-[#45bfae]" />
          <label className="text-xs font-bold text-gray-200">
            Ideal Customer Profile (ICP) & Qualification Criteria
          </label>
        </div>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Define what makes an inbound lead "Qualified" for your business. The AI Revenue Engine strictly incorporates this policy when calculating Intent, Fit, and setting the Next Best Action for every lead.
        </p>

        {/* 1-Click Templates */}
        <div className="mb-3 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#45bfae]" />
            <span>1-Click Presets:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPolicy(t.text)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#45bfae] hover:text-[#5cd4c3] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>+ {t.name}</span>
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
          className="w-full p-4 bg-[#0a0d12] border border-white/10 rounded-2xl text-gray-200 focus:outline-none focus:border-[#45bfae] text-xs font-mono leading-relaxed transition-colors"
          placeholder="e.g. A qualified lead must be a B2B SaaS company with >₦500k budget. If they mention urgency, assign them to a HUMAN immediately..."
        />
      </div>

      {/* Reprocess Option */}
      <div className="p-4 bg-[#0a0d12] border border-white/5 rounded-xl flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-200">
          <input
            type="checkbox"
            checked={reprocess}
            onChange={(e) => setReprocess(e.target.checked)}
            className="w-4 h-4 rounded bg-black/40 border border-white/20 text-[#248277] focus:ring-0 cursor-pointer"
          />
          <div className="flex flex-col">
            <span>Reprocess Active Leads with New Policy</span>
            <span className="text-[11px] font-normal text-gray-400">Re-evaluates unclosed leads and refreshes the Next Best Action</span>
          </div>
        </label>
        <RefreshCw size={14} className="text-gray-500 shrink-0" />
      </div>

      <div className="pt-2">
        <button 
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#45bfae] text-[#0f1214] hover:bg-[#5cd4c3] font-bold text-xs rounded-xl shadow-lg shadow-[#248277]/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Policy...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save AI Policy</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
