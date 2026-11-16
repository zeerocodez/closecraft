'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Download,
  Receipt,
  Sparkles,
} from 'lucide-react';
import GrowthProposalCard from './GrowthProposalCard';
import GrowthMilestonesTracker, { MilestoneItem } from './GrowthMilestonesTracker';
import GrowthReceiptModal from './GrowthReceiptModal';

interface ProjectDetailProps {
  project: {
    id: string;
    reference: string;
    status: string;
    services: string[];
    whatsappThreadUrl?: string | null;
    consultationNotes?: string | null;
    consultedAt?: string | Date | null;
    createdAt: string | Date;
    brief?: {
      businessName: string;
      industry: string;
      businessOverview: string;
      primaryGoal: string;
      targetAudience: string;
      promotedProducts: string;
      urgency: string;
      targetLaunchDate?: string | Date | null;
    } | null;
    assignedPartner?: {
      id: string;
      fullName: string;
      title: string;
      bio?: string | null;
      avatarUrl?: string | null;
      rating?: number | null;
      completedProjectsCount?: number | null;
    } | null;
    proposals: any[];
    projectInvoices: any[];
    milestones: MilestoneItem[];
  };
}

export default function GrowthProjectDetailClient({ project }: ProjectDetailProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Status mapping
  const statuses = [
    { key: 'PENDING_ASSIGNMENT', label: 'Brief Submitted' },
    { key: 'ASSIGNED', label: 'Partner Assigned' },
    { key: 'CONSULTING', label: 'WhatsApp Consultation' },
    { key: 'PROPOSAL_SENT', label: 'Proposal Issued' },
    { key: 'INVOICED', label: 'Invoiced' },
    { key: 'PAID', label: 'Paid' },
    { key: 'IN_DELIVERY', label: 'In Delivery' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStatusIndex = (st: string) => {
    switch (st) {
      case 'PENDING_ASSIGNMENT': return 0;
      case 'ASSIGNED': return 1;
      case 'CONSULTING': return 2;
      case 'PROPOSAL_SENT': return 3;
      case 'PROPOSAL_APPROVED':
      case 'INVOICED': return 4;
      case 'PAID': return 5;
      case 'IN_DELIVERY': return 6;
      case 'COMPLETED': return 7;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(project.status);

  // Find latest active proposal
  const activeProposal = project.proposals.length > 0 ? project.proposals[0] : null;

  // Find paid invoice for receipt
  const paidInvoice = project.projectInvoices.find((inv) => inv.status === 'PAID');

  const handleOpenReceipt = (inv: any) => {
    const receiptData = {
      receiptNumber: `CC-REC-${inv.invoiceNumber.replace(/^CC-INV-(?:PR-)?/, '')}`,
      relatedInvoiceNumber: inv.invoiceNumber,
      customerName: project.brief?.businessName || 'Valued Client',
      businessName: project.brief?.businessName || 'Your Business',
      projectReference: project.reference,
      amountReceived: inv.totalAmount,
      currency: inv.currency || 'NGN',
      paymentDate: inv.paidAt || inv.updatedAt || new Date(),
      paymentMethod: 'Bachs Verified Collection (Card / Transfer)',
      transactionReference: inv.bachsChargeId || inv.bachsCheckoutId,
      paymentStatus: 'PAID',
      itemisedDeliverables: activeProposal?.lineItems || [],
    };
    setSelectedReceipt(receiptData);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 text-white">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#248277]/20 text-[#45bfae] border border-[#248277]/40">
                {project.reference}
              </span>
              <span className="text-xs text-[#71717a]">
                Submitted {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.brief?.businessName || 'Project Growth Workspace'}
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Industry: <span className="text-white font-medium">{project.brief?.industry || 'Commercial Growth'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {project.services.map((svc) => (
              <span
                key={svc}
                className="px-3 py-1 rounded-xl bg-[#080808] border border-[#1f1f1f] text-xs font-semibold text-[#a1a1aa]"
              >
                {svc.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Status Pipeline Step Indicator */}
        <div className="pt-4 border-t border-[#1f1f1f]">
          <p className="text-xs font-bold text-[#71717a] uppercase tracking-wider mb-3">
            Concierge Journey Progress
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {statuses.map((step, idx) => {
              const isDone = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#248277]/20 border-[#248277] text-white shadow-md'
                      : isDone
                      ? 'bg-[#080808] border-emerald-500/40 text-emerald-400'
                      : 'bg-[#080808] border-[#1a1a1a] text-[#71717a]'
                  }`}
                >
                  <p className="text-[10px] font-mono font-bold uppercase truncate">
                    {isDone ? '✓ ' : `${idx + 1}. `}
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Partner Card + Project Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Partner & WhatsApp Consultation */}
        <div className="lg:col-span-1 rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={14} className="text-[#45bfae]" />
              ASSIGNED PARTNER
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              VETTED TALENT
            </span>
          </div>

          {project.assignedPartner ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#248277] to-[#45bfae] p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-[14px] bg-[#141414] flex items-center justify-center font-bold text-lg text-white">
                    {project.assignedPartner.fullName.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{project.assignedPartner.fullName}</h4>
                  <p className="text-xs text-[#a1a1aa]">{project.assignedPartner.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#71717a]">
                    <span>★ {project.assignedPartner.rating || 5.0}</span>
                    <span>·</span>
                    <span>{project.assignedPartner.completedProjectsCount || 12} projects delivered</span>
                  </div>
                </div>
              </div>

              {project.assignedPartner.bio && (
                <p className="text-xs text-[#a1a1aa] leading-relaxed bg-[#080808] p-3 rounded-2xl border border-[#1f1f1f]">
                  {project.assignedPartner.bio}
                </p>
              )}

              {/* Glowing WhatsApp Consultation CTA */}
              <div className="pt-2">
                <a
                  href={project.whatsappThreadUrl || 'https://wa.me/2349026365853'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/20 transition-all active:scale-95 text-center cursor-pointer"
                >
                  <MessageCircle size={17} className="fill-black" />
                  <span>CONTINUE ON WHATSAPP</span>
                </a>
                <p className="text-[10px] text-center text-[#71717a] mt-2">
                  Official CloseCraft Concierge Desk · Prefilled with your project details
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#080808] border border-[#1f1f1f] text-center space-y-2">
              <Clock size={24} className="mx-auto text-amber-400 animate-pulse" />
              <p className="text-xs font-bold text-white">Matching in Progress</p>
              <p className="text-[11px] text-[#a1a1aa]">
                Our 30-minute matching protocol is finding the ideal certified professional for your selected services.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Project Objectives & Brief Summary */}
        <div className="lg:col-span-2 rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#45bfae]" />
              SUBMITTED PROJECT BRIEF
            </span>
            <span className="text-xs text-[#71717a]">
              Urgency: <strong className="text-[#45bfae]">{project.brief?.urgency || 'STANDARD'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f]">
              <span className="text-[#71717a] block text-[11px]">PRIMARY GOAL</span>
              <p className="text-white font-medium mt-1">{project.brief?.primaryGoal || 'Acquire paying customers.'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f]">
              <span className="text-[#71717a] block text-[11px]">TARGET AUDIENCE</span>
              <p className="text-white font-medium mt-1">{project.brief?.targetAudience || 'Qualified B2B & B2C decision makers.'}</p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#080808] border border-[#1f1f1f]">
              <span className="text-[#71717a] block text-[11px]">PROMOTED PRODUCTS / OFFERS</span>
              <p className="text-white font-medium mt-1">{project.brief?.promotedProducts || 'Core commercial services.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Review Section */}
      {activeProposal && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#45bfae]" />
            <h2 className="text-xl font-extrabold text-white">Commercial Proposal &amp; Quotation</h2>
          </div>
          <GrowthProposalCard proposal={activeProposal} />
        </section>
      )}

      {/* Invoices & Receipts Section */}
      {project.projectInvoices.length > 0 && (
        <section className="rounded-3xl bg-[#101010] border border-[#1f1f1f] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-[#45bfae]" />
              <h3 className="text-lg font-bold text-white">Invoices &amp; Verified Receipts</h3>
            </div>
            <span className="text-xs text-[#71717a]">
              Bachs HMAC Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.projectInvoices.map((inv) => {
              const isPaid = inv.status === 'PAID';

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono font-bold text-xs text-white">{inv.invoiceNumber}</p>
                    <p className="text-sm font-mono font-extrabold text-[#45bfae] mt-0.5">
                      ₦{Number(inv.totalAmount).toLocaleString()} {inv.currency}
                    </p>
                    <p className="text-[11px] text-[#71717a]">
                      {isPaid ? `Paid on ${new Date(inv.paidAt || inv.updatedAt).toLocaleDateString()}` : 'Awaiting Payment'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <button
                        onClick={() => handleOpenReceipt(inv)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/40 cursor-pointer transition-colors"
                      >
                        <Receipt size={14} />
                        <span>View Receipt</span>
                      </button>
                    ) : (
                      inv.bachsCheckoutUrl && (
                        <a
                          href={inv.bachsCheckoutUrl}
                          className="px-4 py-1.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Pay Invoice
                        </a>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Milestones Delivery Section */}
      <section className="space-y-4">
        <GrowthMilestonesTracker
          milestones={project.milestones}
          isClientView={true}
        />
      </section>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <GrowthReceiptModal
          receipt={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

