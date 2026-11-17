'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface DiagnosticAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagnosticAuditModal({ isOpen, onClose }: DiagnosticAuditModalProps) {
  const [leadVolume, setLeadVolume] = useState<'Fewer than 20' | '20–49' | '50–199' | '200 or more'>('50–199');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [primaryBottleneck, setPrimaryBottleneck] = useState('Forgotten follow-ups');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          company: businessName,
          leadVolume,
          primaryBottleneck,
          source: 'WEBSITE_AUDIT',
          type: 'AUDIT',
          message: `Revenue Audit Request: ${businessName} receives ${leadVolume} monthly enquiries. Primary follow-up bottleneck: ${primaryBottleneck}.`
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit audit request.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-[#101010] border border-[#248277]/50 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#248277]/20 text-[#45bfae] font-bold uppercase tracking-wider">
                RAPID FOLLOW-UP DIAGNOSTIC
              </span>
              <h3 id="audit-modal-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Show us where follow-up gets difficult.
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Tell us about your current enquiry volume and where leads get stuck. We will assess your follow-up process and help you plug the revenue leak.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Volume Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                Monthly Inbound Enquiry Volume:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Fewer than 20', '20–49', '50–199', '200 or more'] as const).map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setLeadVolume(vol)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      leadVolume === vol
                        ? 'bg-[#248277] text-white border-[#45bfae] shadow-md shadow-[#248277]/20'
                        : 'bg-[#181818] text-zinc-400 border-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {vol}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottleneck Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">
                Primary Follow-Up Challenge:
              </label>
              <select
                value={primaryBottleneck}
                onChange={(e) => setPrimaryBottleneck(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:border-[#45bfae] focus:outline-none"
              >
                <option value="Unanswered inquiries">Enquiries sitting unanswered in WhatsApp or DMs</option>
                <option value="Slow response time">Response times are too slow (leads cooling down)</option>
                <option value="Forgotten follow-ups">Reps forget callbacks or fail to follow up consistently</option>
                <option value="No owner visibility">No clear owner visibility into the active pipeline</option>
                <option value="Poor qualification">Reps wasting time on unqualified tire-kickers</option>
              </select>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Services"
                  className="w-full py-2 px-3 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:border-[#45bfae] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Alex Okoro"
                  className="w-full py-2 px-3 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:border-[#45bfae] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="alex@acme.com"
                  className="w-full py-2 px-3 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:border-[#45bfae] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">WhatsApp / Phone</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full py-2 px-3 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:border-[#45bfae] focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing Follow-Up Process...</span>
                  </>
                ) : (
                  <>
                    <span>Request My Revenue Audit</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="text-xs text-[#45bfae] hover:underline font-semibold"
                >
                  Or start a 7-day Starter trial directly (no credit card required) &rarr;
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Your request has been received.
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed max-w-md mx-auto">
                Your request has been received. We will contact you using the details you provided to discuss your current follow-up process.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] text-xs text-zinc-300 space-y-2 text-left">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Clock size={14} className="text-[#45bfae]" />
                <span>Next Steps:</span>
              </div>
              <p className="text-[11px] text-[#a1a1aa]">
                Our team will review your enquiry volume ({leadVolume}) and bottleneck ({primaryBottleneck}) to prepare specific follow-up recommendations.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-[#248277]/20"
              >
                <span>Create Your Trial Workspace</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-[#181818] hover:bg-[#222226] text-white font-bold text-xs border border-white/10"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
