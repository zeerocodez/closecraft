"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateQualificationPolicy } from '@/app/(saas)/actions';

interface QualificationPolicyModalProps {
  currentPolicy?: string | null;
  buttonLabel?: string;
  className?: string;
  triggerVariant?: 'button' | 'banner' | 'link';
}

const PRESET_TEMPLATES = [
  {
    id: 'b2b_enterprise',
    name: 'B2B Enterprise & Managed Closers',
    badge: '₦500k+ High Ticket',
    desc: 'For B2B companies requiring executive decision makers and commercial budgets.',
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
    id: 'dss_academy',
    name: 'Digital Sales School (DSS) Academy',
    badge: '₦80k+ Cohort',
    desc: 'For sales training, student enrollment, and coaching admissions.',
    text: `A lead is QUALIFIED if:
1. Prospect is an aspiring sales closer, freelancer, career switcher, or junior rep.
2. Budget is at least ₦80,000 for tuition or coaching fees.
3. Seeking enrollment in the upcoming 8-week cohort.
4. Shows clear motivation and time commitment for live practice sessions.

DISQUALIFICATION RULES:
- If budget is strictly below ₦80,000, route to AUTOMATION for tuition installment/scholarship guide.
- Qualified applicants should receive SEND_BOOKING_LINK for admissions diagnostic.`
  },
  {
    id: 'saas_tech',
    name: 'High-Ticket SaaS & Tech Consulting',
    badge: 'Enterprise SaaS',
    desc: 'For recurring SaaS subscriptions and pipeline leakage elimination.',
    text: `A lead is QUALIFIED if:
1. Company has an active sales team (>5 sales reps).
2. Experiencing stalled pipeline, slow response times, or CRM lead leakage.
3. Budget is at least $2,000/month (₦3,000,000+).
4. Decision-maker is VP of Sales, CRO, or Founder.

ACTIONS:
- Leads with immediate timeline (<14 days) must ASSIGN_HUMAN with a 15-minute SLA.
- Medium leads should be sent an interactive product tour demo.`
  }
];

export function QualificationPolicyModal({
  currentPolicy,
  buttonLabel = "ICP Qualification Logic",
  className = "",
  triggerVariant = 'button'
}: QualificationPolicyModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [policyText, setPolicyText] = useState(currentPolicy || PRESET_TEMPLATES[0].text);
  const [reprocessExisting, setReprocessExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const isConfigured = Boolean(currentPolicy && currentPolicy.trim().length > 10);

  function applyTemplate(templateText: string) {
    setPolicyText(templateText);
    setStatusMsg({
      type: 'success',
      text: 'Template applied! You can customize the details below before saving.'
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!policyText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter your qualification rules.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await updateQualificationPolicy(policyText, reprocessExisting);
      if (!res.success) throw new Error("Failed to save policy.");

      setStatusMsg({
        type: 'success',
        text: reprocessExisting 
          ? "Qualification logic saved & all leads re-evaluated through the Revenue Engine!" 
          : "Qualification logic saved successfully!"
      });

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error updating qualification policy.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {triggerVariant === 'banner' ? (
        <div className="w-full p-4 rounded-xl bg-primary/10 border border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-semibold text-sm text-on-surface">Organization Qualification Logic (ICP)</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isConfigured 
                    ? 'bg-primary/20 text-primary border border-primary/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isConfigured ? 'Custom Criteria Active' : 'Default Fallback Rules'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {isConfigured
                  ? "Every lead is strictly scored and routed according to your custom qualification rules."
                  : "Each organization has unique criteria for qualified leads. Set your budget thresholds and authority rules so the Revenue Engine routes accurately for your business."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>{isConfigured ? 'Edit Qualification Criteria' : 'Set Qualification Logic Now'}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={className || "h-10 px-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/60 text-sm font-semibold rounded-md flex items-center gap-2 shadow-sm transition-colors cursor-pointer"}
        >
          <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
          <span>{buttonLabel}</span>
          {isConfigured ? (
            <span className="w-2 h-2 rounded-full bg-primary" title="Custom Policy Active"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Default Rules"></span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg text-on-surface">Tenant Qualification Policy &amp; ICP Rules</h2>
                  <p className="text-xs text-on-surface-variant">
                    Define what makes a lead "Qualified" for your business. The AI Revenue Engine executes these rules deterministically.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
              
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  1-Click Industry Templates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.text)}
                      className="p-3.5 rounded-xl border border-surface-container hover:border-primary/50 bg-surface-container-low/60 hover:bg-surface-container-low cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-on-surface line-clamp-1">{tmpl.name}</span>
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase mb-2">
                          {tmpl.badge}
                        </span>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">{tmpl.desc}</p>
                      </div>
                      <span className="mt-2 text-[11px] font-bold text-primary flex items-center gap-1">
                        Use Template &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Message */}
              {statusMsg && (
                <div className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
                  statusMsg.type === 'success' 
                    ? 'bg-primary-container/20 border-primary text-primary' 
                    : 'bg-error-container/30 border-error text-error'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {statusMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Policy Editor Textarea */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Qualification Logic Guidelines &amp; Hard Business Rules
                  </label>
                  <span className="text-[11px] text-primary font-semibold">Strict Multi-Tenant Isolation</span>
                </div>
                <textarea
                  rows={9}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="w-full p-4 bg-surface-container-low border border-surface-container rounded-xl text-on-surface text-xs md:text-sm font-mono leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Define your qualification criteria..."
                  required
                />
                <p className="text-[11px] text-on-surface-variant">
                  The Revenue Engine ingests this policy for every lead submission, CSV import, and WhatsApp inquiry.
                </p>
              </div>

              {/* Reprocess Option */}
              <div className="p-3.5 bg-surface-container-low border border-surface-container rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="reprocess"
                    checked={reprocessExisting}
                    onChange={(e) => setReprocessExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="reprocess" className="text-xs font-bold text-on-surface cursor-pointer">
                    Immediately re-evaluate all existing leads with this new logic
                  </label>
                </div>
                <span className="text-[11px] text-on-surface-variant hidden sm:inline">
                  Updates Intent, Fit &amp; Next Best Actions
                </span>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving &amp; Reprocessing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Save &amp; Activate Qualification Policy</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
