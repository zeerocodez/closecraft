import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Plus,
} from 'lucide-react';

export const metadata = {
  title: 'My Growth Projects | Closecraft',
  description: 'Manage your custom business growth projects, proposals, invoices, and delivery milestones.',
};

export default async function GrowthProjectsIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const organizationId = (session as any).organizationId;
  if (!organizationId) redirect('/login');

  const projects = await db.projectRequest.findMany({
    where: { organizationId },
    include: {
      brief: true,
      assignedPartner: {
        select: {
          fullName: true,
          bio: true,
        },
      },
      proposals: {
        where: { status: 'SENT' },
        select: { id: true, proposalNumber: true, totalAmount: true },
      },
      projectInvoices: {
        where: { status: 'ISSUED' },
        select: { id: true, invoiceNumber: true, totalAmount: true, bachsCheckoutUrl: true },
      },
      milestones: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCount = projects.length;
  const inDeliveryCount = projects.filter((p) => p.status === 'IN_DELIVERY').length;
  const awaitingActionCount = projects.filter(
    (p) => p.status === 'PROPOSAL_SENT' || p.status === 'INVOICED'
  ).length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-white">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#45bfae] uppercase tracking-wider">
            CONCIERGE GROWTH PLATFORM
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            My Growth Projects
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Custom ads management, AI creative suites, landing pages, and VSL deliverables.
          </p>
        </div>

        <Link
          href="/services"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Select New Services</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f]">
          <p className="text-xs text-[#71717a]">Total Requests</p>
          <p className="text-2xl font-black font-mono text-white mt-1">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f]">
          <p className="text-xs text-[#71717a]">In Delivery</p>
          <p className="text-2xl font-black font-mono text-[#45bfae] mt-1">{inDeliveryCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f]">
          <p className="text-xs text-[#71717a]">Awaiting Decision</p>
          <p className="text-2xl font-black font-mono text-amber-400 mt-1">{awaitingActionCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#101010] border border-[#1f1f1f]">
          <p className="text-xs text-[#71717a]">Completed</p>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#101010] border border-[#1f1f1f] text-center space-y-4">
          <Layers size={36} className="mx-auto text-[#71717a]" />
          <div>
            <h3 className="text-base font-bold text-white">No Growth Projects Active Yet</h3>
            <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto mt-1">
              Select one or more of our introductory growth services to submit your project brief and receive a tailored proposal.
            </p>
          </div>
          <Link
            href="/services"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs inline-flex items-center gap-2"
          >
            <span>Explore Growth Services</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => {
            const hasPendingProposal = proj.proposals.length > 0;
            const hasPendingInvoice = proj.projectInvoices.length > 0;
            const completedMilestones = proj.milestones.filter((m) => m.status === 'APPROVED').length;

            return (
              <Link
                key={proj.id}
                href={`/growth/projects/${proj.reference}`}
                className="block p-5 sm:p-6 rounded-3xl bg-[#101010] border border-[#1f1f1f] hover:border-[#248277]/50 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#45bfae]">
                        {proj.reference}
                      </span>
                      <span className="text-[11px] text-[#71717a]">
                        Submitted {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#45bfae] transition-colors">
                      {proj.brief?.businessName || 'Growth Project'}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {proj.services.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-lg bg-[#080808] border border-[#1f1f1f] text-[11px] text-[#a1a1aa]"
                        >
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1a1a1a] text-white font-bold border border-[#2a2a2a] block">
                        {proj.status.replace(/_/g, ' ')}
                      </span>

                      {proj.assignedPartner && (
                        <span className="text-[11px] text-[#71717a] block">
                          Partner: {proj.assignedPartner.fullName}
                        </span>
                      )}

                      {proj.milestones.length > 0 && (
                        <span className="text-[10px] font-mono text-[#a1a1aa] block">
                          Milestones: {completedMilestones}/{proj.milestones.length}
                        </span>
                      )}
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-[#71717a] group-hover:text-[#45bfae] group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>

                {/* Notification pill if action required */}
                {(hasPendingProposal || hasPendingInvoice) && (
                  <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center gap-2 text-xs text-amber-300">
                    <AlertCircle size={14} />
                    <span>
                      {hasPendingProposal
                        ? 'Proposal ready for your review and approval.'
                        : 'Invoice issued. Complete payment to begin delivery.'}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
