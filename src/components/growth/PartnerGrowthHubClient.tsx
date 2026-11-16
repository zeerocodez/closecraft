'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  ExternalLink,
  Layers,
  Send,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LineItemDraft {
  serviceType: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  deliverablesText: string;
}

interface PartnerProject {
  id: string;
  reference: string;
  status: string;
  services: string[];
  whatsappThreadUrl?: string | null;
  consultationNotes?: string | null;
  consultedAt?: string | null;
  createdAt: string;
  brief?: {
    businessName: string;
    industry: string;
    primaryGoal: string;
    targetAudience: string;
    promotedProducts: string;
    urgency: string;
  } | null;
  proposals: Array<{
    id: string;
    proposalNumber: string;
    title: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  milestones: Array<{
    id: string;
    serviceType: string;
    title: string;
    status: string;
    sequenceOrder: number;
    proofUrl?: string | null;
    reviewNotes?: string | null;
  }>;
}

export default function PartnerGrowthHubClient({
  projects,
  partnerName,
}: {
  projects: PartnerProject[];
  partnerName: string;
}) {
  const router = useRouter();

  // Consultation Notes Modal State
  const [activeConsultModalProject, setActiveConsultModalProject] = useState<PartnerProject | null>(null);
  const [consultNotes, setConsultNotes] = useState('');

  // Proposal Drafting Modal State
  const [activePropModalProject, setActivePropModalProject] = useState<PartnerProject | null>(null);
  const [proposalTitle, setProposalTitle] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  // Deliverable Submission Modal State
  const [activeMilestoneModal, setActiveMilestoneModal] = useState<{
    project: PartnerProject;
    milestone: any;
  } | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Open Proposal Modal with default line items from project services
  const openProposalModal = (proj: PartnerProject) => {
    setActivePropModalProject(proj);
    setProposalTitle(`Growth Implementation — ${proj.brief?.businessName || 'Client'}`);
    setScopeSummary(
      `Custom growth delivery plan for ${proj.brief?.businessName || 'the client'}, covering ${proj.services
        .map((s) => s.replace(/_/g, ' '))
        .join(', ')}.`
    );
    setEstimatedDays(14);

    const initialItems: LineItemDraft[] = proj.services.map((svc) => ({
      serviceType: svc,
      title: `${svc.replace(/_/g, ' ')} Execution`,
      description: `Complete deliverables for ${svc.replace(/_/g, ' ')} tailored to ${proj.brief?.businessName || 'client'}.`,
      quantity: 1,
      unitPrice: 150000,
      deliverablesText: 'Core Deliverable Asset Suite\nHigh-Resolution Outputs\nReview & Revision Round',
    }));
    setLineItems(initialItems);
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsultModalProject) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/growth/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectRequestId: activeConsultModalProject.id,
          action: 'LOG_NOTES',
          status: 'CONSULTING',
          notes: consultNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update consultation.');

      setSuccessMsg(`Consultation notes saved for project ${activeConsultModalProject.reference}.`);
      setActiveConsultModalProject(null);
      setConsultNotes('');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePropModalProject) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formattedItems = lineItems.map((li) => ({
        serviceType: li.serviceType,
        title: li.title,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        deliverables: li.deliverablesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      }));

      const res = await fetch('/api/growth/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectRequestId: activePropModalProject.id,
          title: proposalTitle,
          scopeSummary,
          estimatedDays,
          lineItems: formattedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create proposal.');

      setSuccessMsg(`Proposal created successfully! Sent to client for review.`);
      setActivePropModalProject(null);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMilestoneModal) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/growth/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: activeMilestoneModal.milestone.id,
          proofUrl,
          submissionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit milestone deliverable.');

      setSuccessMsg(`Deliverable submitted for "${activeMilestoneModal.milestone.title}"! Client notified for review.`);
      setActiveMilestoneModal(null);
      setProofUrl('');
      setSubmissionNotes('');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
        <div>
          <span className="text-xs font-mono font-bold text-[#45bfae] uppercase tracking-wider">
            PARTNER TALENT POOL
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Growth Projects Assigned to You
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Welcome back, <strong className="text-white">{partnerName}</strong>. Review client briefs, lead WhatsApp discovery, issue proposals, and upload deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#101010] border border-[#248277]/40 text-xs font-mono font-bold text-[#45bfae]">
            {projects.length} Active {projects.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle size={15} />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#101010] border border-[#1f1f1f] text-center space-y-3">
          <Briefcase size={36} className="mx-auto text-[#71717a]" />
          <h3 className="text-base font-bold text-white">No Assigned Growth Projects Yet</h3>
          <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
            When new client enquiries match your verified skills in ads, video, flyers, landing pages, or VSLs, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj) => {
            const hasSentProposal = proj.proposals.some((p) => p.status === 'SENT' || p.status === 'ACCEPTED');

            return (
              <div
                key={proj.id}
                className="rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 space-y-6 shadow-xl"
              >
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f1f1f]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#248277]/20 text-[#45bfae] border border-[#248277]/40">
                        {proj.reference}
                      </span>
                      <span className="text-xs text-[#71717a]">
                        Submitted {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {proj.brief?.businessName || 'Client Project'}
                    </h3>
                    <p className="text-xs text-[#a1a1aa]">
                      Industry: <span className="text-white">{proj.brief?.industry || 'Commercial Growth'}</span>
                      {' · '}
                      Urgency: <strong className="text-[#45bfae]">{proj.brief?.urgency || 'STANDARD'}</strong>
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={proj.whatsappThreadUrl || 'https://wa.me/2349026365853'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} className="fill-black" />
                      <span>WhatsApp Client</span>
                    </a>

                    <button
                      onClick={() => {
                        setActiveConsultModalProject(proj);
                        setConsultNotes(proj.consultationNotes || '');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-white font-semibold text-xs border border-[#2a2a2a] transition-colors cursor-pointer"
                    >
                      Log Notes
                    </button>

                    <button
                      onClick={() => openProposalModal(proj)}
                      className="px-4 py-2 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Draft Proposal</span>
                    </button>
                  </div>
                </div>

                {/* Brief Summary Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#080808] p-4 rounded-2xl border border-[#1f1f1f]">
                  <div>
                    <span className="text-[#71717a] block text-[11px]">SERVICES REQUESTED</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.services.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-[#141414] text-[#a1a1aa] font-mono text-[10px]">
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#71717a] block text-[11px]">PRIMARY GOAL</span>
                    <p className="text-white mt-1 leading-snug">{proj.brief?.primaryGoal || 'Acquire paying clients.'}</p>
                  </div>

                  <div>
                    <span className="text-[#71717a] block text-[11px]">TARGET AUDIENCE</span>
                    <p className="text-white mt-1 leading-snug">{proj.brief?.targetAudience || 'Qualified leads.'}</p>
                  </div>
                </div>

                {/* Milestones Delivery Queue */}
                {proj.milestones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                      Delivery Milestones &amp; Submissions
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {proj.milestones.map((ms) => {
                        const isApproved = ms.status === 'APPROVED';
                        const isSubmitted = ms.status === 'SUBMITTED';

                        return (
                          <div
                            key={ms.id}
                            className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-white">{ms.title}</p>
                              <span className="text-[10px] font-mono text-[#71717a]">
                                Status: {ms.status}
                              </span>
                            </div>

                            <div>
                              {isApproved ? (
                                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Approved
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveMilestoneModal({ project: proj, milestone: ms });
                                    setProofUrl(ms.proofUrl || '');
                                    setSubmissionNotes(ms.reviewNotes || '');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs cursor-pointer transition-colors"
                                >
                                  {isSubmitted ? 'Update Proof' : 'Upload Proof'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Consultation Notes Modal */}
      {activeConsultModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#1f1f1f] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f]">
              <h4 className="font-extrabold text-sm text-white">
                Log WhatsApp Consultation — {activeConsultModalProject.reference}
              </h4>
              <button
                onClick={() => setActiveConsultModalProject(null)}
                className="text-[#71717a] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#a1a1aa]">
              Record notes from your WhatsApp discussion with {activeConsultModalProject.brief?.businessName || 'the client'}. This logs consultation completion and updates project records.
            </p>

            <textarea
              rows={5}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="e.g. Discussed client's ₦200,000 monthly Meta ads budget. Agreed on 3 flyer concepts and 1 core landing page. Ready for commercial proposal."
              className="w-full p-3 rounded-2xl bg-[#141414] border border-[#262626] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#45bfae]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveConsultModalProject(null)}
                className="px-4 py-2 text-xs text-[#a1a1aa] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConsultationSubmit}
                disabled={isSubmitting || !consultNotes.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Consultation Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Drafting Modal */}
      {activePropModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d0d] border border-[#1f1f1f] rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <h3 className="font-extrabold text-base text-white">
                Draft Commercial Proposal — {activePropModalProject.reference}
              </h3>
              <button
                onClick={() => setActivePropModalProject(null)}
                className="text-[#71717a] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#a1a1aa] font-semibold block mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div>
                <label className="text-[#a1a1aa] font-semibold block mb-1">Scope Summary</label>
                <textarea
                  rows={2}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div className="w-1/2">
                <label className="text-[#a1a1aa] font-semibold block mb-1">Estimated Delivery Timeline (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-2">
                <label className="text-white font-bold block uppercase tracking-wider text-[11px]">
                  Deliverable Line Items
                </label>

                {lineItems.map((li, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#71717a] text-[10px] block">Title</label>
                        <input
                          type="text"
                          value={li.title}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].title = e.target.value;
                            setLineItems(updated);
                          }}
                          className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[#71717a] text-[10px] block">Price in NGN (₦)</label>
                        <input
                          type="number"
                          value={li.unitPrice}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].unitPrice = Number(e.target.value);
                            setLineItems(updated);
                          }}
                          className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#71717a] text-[10px] block">
                        Included Deliverables Checklist (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={li.deliverablesText}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].deliverablesText = e.target.value;
                          setLineItems(updated);
                        }}
                        className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                <span className="text-xs text-[#71717a]">Total Proposal Scope:</span>
                <span className="text-xl font-bold font-mono text-[#45bfae]">
                  ₦{lineItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0).toLocaleString()} NGN
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActivePropModalProject(null)}
                className="px-4 py-2 text-xs text-[#a1a1aa] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProposalSubmit}
                disabled={isSubmitting || lineItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Issue Proposal to Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliverable Proof Submission Modal */}
      {activeMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#1f1f1f] rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f]">
              <h4 className="font-extrabold text-sm text-white">
                Upload Milestone Deliverable Proof
              </h4>
              <button
                onClick={() => setActiveMilestoneModal(null)}
                className="text-[#71717a] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#a1a1aa]">
              Milestone: <strong className="text-white">{activeMilestoneModal.milestone.title}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#a1a1aa] font-semibold block mb-1">
                  Deliverable URL (Figma, Loom, Google Drive, or Asset Link)
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://www.figma.com/file/... or https://loom.com/share/..."
                  className="w-full p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                />
              </div>

              <div>
                <label className="text-[#a1a1aa] font-semibold block mb-1">Notes for Client Review</label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Completed initial 3 concept variations for Instagram feed. Ready for your review and feedback."
                  className="w-full p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#45bfae]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveMilestoneModal(null)}
                className="px-4 py-2 text-xs text-[#a1a1aa] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeliverableSubmit}
                disabled={isSubmitting || !proofUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Client Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

