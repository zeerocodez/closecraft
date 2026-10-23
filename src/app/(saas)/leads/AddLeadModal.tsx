"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addManualLead } from '@/app/(saas)/actions';

export function AddLeadModal({ buttonLabel = "Add Lead", className = "" }: { buttonLabel?: string; className?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim() || "";
    const company = (formData.get('company') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const source = (formData.get('source') as string)?.trim() || 'Manual Entry';
    const intentStr = formData.get('buyingIntent') as string;
    const buyingIntent = intentStr ? parseInt(intentStr, 10) : 80;
    const notes = (formData.get('notes') as string)?.trim();

    if (!name) {
      setError("Please provide the prospect's full name.");
      setLoading(false);
      return;
    }

    if (!email && !phone) {
      setError("Please provide at least a Phone/WhatsApp number or an Email address.");
      setLoading(false);
      return;
    }

    const message = company 
      ? `[${company}] ${notes || 'Inbound inquiry'}`
      : notes || 'Manual lead entry';

    try {
      await addManualLead({
        name,
        email: email || undefined,
        source,
        phone: phone || undefined,
        message,
        buyingIntent: !isNaN(buyingIntent) ? buyingIntent : 80
      });
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create lead. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "h-10 px-4 bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold rounded-md flex items-center gap-2 shadow-sm transition-colors cursor-pointer"}
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg text-on-surface">Add New Lead</h2>
                  <p className="text-xs text-on-surface-variant">The Revenue Engine will immediately analyze signals and schedule the Next Best Action.</p>
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

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
              {error && (
                <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Full Name *</label>
                  <input required name="name" type="text" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Adaeze Okoro" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Phone / WhatsApp Number</label>
                  <input name="phone" type="text" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="+234 803 000 0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Work Email (Optional)</label>
                  <input name="email" type="email" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="adaeze@cedarops.ng" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Company / Organization</label>
                  <input name="company" type="text" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Cedar Consulting" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Lead Source</label>
                  <select name="source" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary">
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="Website Revenue Audit">Website Revenue Audit</option>
                    <option value="Inbound WhatsApp">Inbound WhatsApp</option>
                    <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                    <option value="Executive Referral">Executive Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Buying Intent Score (1-100)</label>
                  <input name="buyingIntent" type="number" min="1" max="100" defaultValue="85" className="w-full h-10 px-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Customer Need / Notes for AI Engine</label>
                <textarea name="notes" rows={3} className="w-full p-3 bg-surface-container-low border border-surface-container rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Urgent: Needs automated qualification and booking for 15 sales reps..." />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-container mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Engine...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Ingest Lead</span>
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
