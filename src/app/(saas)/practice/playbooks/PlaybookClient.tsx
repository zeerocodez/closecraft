'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { createSalesPlaybookAction, prepareForCrmOpportunity } from '@/app/(saas)/practice-actions';

export default function PlaybookClient({
  playbooks,
  activeLeads,
}: {
  playbooks: any[];
  activeLeads: any[];
}) {
  const router = useRouter();
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [title, setTitle] = useState('');
  const [offerBrief, setOfferBrief] = useState('');
  const [targetIcp, setTargetIcp] = useState('');
  const [isSavingPlaybook, setIsSavingPlaybook] = useState(false);
  const [isPreparingLeadId, setIsPreparingLeadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreatePlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !offerBrief.trim()) return;

    setIsSavingPlaybook(true);
    setErrorMessage(null);
    try {
      const res = await createSalesPlaybookAction({
        title,
        offerBrief,
        targetIcp,
      });
      if (res.success) {
        setShowPlaybookModal(false);
        setTitle('');
        setOfferBrief('');
        setTargetIcp('');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save sales playbook.');
    } finally {
      setIsSavingPlaybook(false);
    }
  };

  const handlePrepareLead = async (leadId: string) => {
    setIsPreparingLeadId(leadId);
    setErrorMessage(null);
    try {
      const res = await prepareForCrmOpportunity(leadId);
      if (res.sessionId) {
        router.push(`/practice/session/${res.sessionId}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to launch rehearsal session.');
      setIsPreparingLeadId(null);
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* CRM Opportunity Rehearsal Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Icon name="Users" size={20} className="text-primary" />
              Prepare for Active CRM Conversations
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Rehearse qualification, objection handling, and pricing boundaries privately before your live call or WhatsApp chat.
            </p>
          </div>
        </div>

        {activeLeads.length === 0 ? (
          <div className="p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest text-center text-xs text-on-surface-variant">
            No active open enquiries found in your organization CRM. New enquiries captured via the website or manual entry will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {lead.status}
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {lead.source || 'Inbound'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface">{lead.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    "{lead.message || 'No initial message provided'}"
                  </p>

                  {lead.estimatedValue && (
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      Est. {lead.currency || 'NGN'} {lead.estimatedValue.toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePrepareLead(lead.id)}
                  disabled={isPreparingLeadId === lead.id}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isPreparingLeadId === lead.id ? (
                    <>
                      <Icon name="Loader2" size={14} className="animate-spin" />
                      Generating Private Rehearsal...
                    </>
                  ) : (
                    <>
                      <Icon name="Play" size={14} />
                      Prepare for Conversation
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organization Sales Playbooks Section */}
      <div className="space-y-4 pt-6 border-t border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Icon name="BookOpen" size={20} className="text-primary" />
              Approved Company Playbooks
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Approved offer boundaries, ICP definitions, and objection terms used to power team practice drills.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPlaybookModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30 self-start sm:self-auto"
          >
            <Icon name="Plus" size={16} />
            Add Company Playbook
          </button>
        </div>

        {playbooks.length === 0 ? (
          <div className="p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest text-center space-y-2 text-xs text-on-surface-variant">
            <p>No custom company playbooks uploaded yet.</p>
            <p>Your team is currently practising on the foundational DSS 12-Workshop curriculum.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playbooks.map((pb) => (
              <div
                key={pb.id}
                className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-on-surface">{pb.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    v{pb.version} • {pb.status}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                  {pb.offerBrief}
                </p>

                {pb.targetIcp && (
                  <div className="text-[11px] text-on-surface-variant font-mono pt-1">
                    <strong>Target ICP:</strong> {pb.targetIcp}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playbook Creation Modal */}
      {showPlaybookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">New Approved Sales Playbook</h3>
              <button
                type="button"
                onClick={() => setShowPlaybookModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlaybook} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-on-surface mb-1">Playbook Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Closecraft Enterprise Logistics ICP & Offer"
                  className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Approved Offer Brief & Scope</label>
                <textarea
                  required
                  rows={4}
                  value={offerBrief}
                  onChange={(e) => setOfferBrief(e.target.value)}
                  placeholder="Describe approved deliverables, pricing, constraints, and prerequisites..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Target ICP</label>
                <input
                  type="text"
                  value={targetIcp}
                  onChange={(e) => setTargetIcp(e.target.value)}
                  placeholder="e.g. Logistics firms with 20+ monthly WhatsApp enquiries"
                  className="w-full p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaybookModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlaybook}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-contrast hover:bg-primary-hover font-bold disabled:opacity-50"
                >
                  {isSavingPlaybook ? 'Saving Playbook...' : 'Save Playbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
