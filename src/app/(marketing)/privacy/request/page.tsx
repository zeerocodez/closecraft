'use client';

import React, { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PrivacyRequestPage() {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/privacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit privacy request.');
      }

      setSuccess(json);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 px-4 pb-20">
      <div className="max-w-3xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 shadow-sm"
          >
            &larr; Back to Privacy Notice
          </Link>
          <span className="text-xs text-on-surface-variant">DSR Portal · NDPA 2023 Compliant</span>
        </div>

        <div className="mb-10">
          <div className="eyebrow mb-3">DATA SUBJECT RIGHTS</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Submit a Privacy Request
          </h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Use this secure portal to exercise your rights under data protection law to request access, correction, export, or deletion of your personal data held by Closecraft.
          </p>
        </div>

        {success ? (
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-primary/30 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check size={28} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Privacy Request Received</h2>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm space-y-2">
              <p><strong>Tracking Reference:</strong> <span className="font-mono text-primary font-bold">{success.referenceId}</span></p>
              <p className="text-on-surface-variant">{success.turnaround}</p>
              {success.requiresOwnerConfirmation && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 mt-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Note: Complete erasure of an organization workspace's customer records requires written authorization from the verified Workspace Owner. Our Data Protection Officer will reach out to verify this authority.
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              A confirmation receipt has been generated. For follow-up queries, contact <a href="mailto:privacy@closecraft.com" className="text-primary hover:underline">privacy@closecraft.com</a> citing your reference.
            </p>
            <div className="pt-2">
              <Link href="/" className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs inline-block">
                Return to Closecraft
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    placeholder="Chidi Okonjo"
                    className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="chidi@yourcompany.ng"
                    className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="organizationName" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Workspace / Organization Name (if applicable)
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Apex Global Consulting"
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="requestType" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Request Type *
                </label>
                <select
                  id="requestType"
                  name="requestType"
                  defaultValue="ACCESS"
                  className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ACCESS">Data Access &amp; Export (Receive a copy of your records)</option>
                  <option value="CORRECTION">Data Correction (Rectify inaccurate personal details)</option>
                  <option value="DELETION">Data Erasure / Deletion (Delete your account or workspace)</option>
                  <option value="OBJECTION">Objection / Opt-Out (Withdraw consent for optional communications)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="details" className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Details of Request *
                </label>
                <textarea
                  id="details"
                  name="details"
                  required
                  rows={4}
                  placeholder="Please specify which records or personal information this request concerns..."
                  className="w-full p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Legal Notice */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-on-surface">
                  <ShieldCheck size={15} className="text-primary" />
                  <span>Identity Verification &amp; Retention Safeguards</span>
                </div>
                <p>
                  To protect customer privacy, our Data Protection Officer will verify that the requesting email owns or is authorized to act on the requested records before releasing or modifying data.
                </p>
                <p>
                  Statutory tax receipts and invoice records processed via Bachs are retained for 6 years as required by Nigerian financial reporting regulations.
                </p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
              >
                {busy ? 'Logging Request...' : 'Submit Privacy Request'} <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
