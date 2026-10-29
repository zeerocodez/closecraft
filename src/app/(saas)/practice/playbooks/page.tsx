import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Icon } from '@/components/ui/Icon';
import PlaybookClient from './PlaybookClient';

export const metadata = {
  title: 'Company Playbooks & CRM Prep | Closecraft',
  description: 'Approved sales playbooks and live-opportunity rehearsal.',
};

export default async function PlaybooksPage() {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;

  const playbooks = organizationId
    ? await prisma.salesPlaybook.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const activeLeads = organizationId
    ? await prisma.lead.findMany({
        where: {
          organizationId,
          isArchived: false,
          status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT'] },
        },
        select: {
          id: true,
          name: true,
          source: true,
          message: true,
          status: true,
          estimatedValue: true,
          currency: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <Link href="/practice" className="hover:text-on-surface transition-colors">
              Practice Studio
            </Link>
            <span>/</span>
            <span>Playbooks & CRM Rehearsal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mt-1">
            Company Playbooks & CRM Prep
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Deploy approved company offer briefs and rehearse live CRM opportunities privately before speaking to prospects.
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30 self-start sm:self-auto"
        >
          ← Back to Studio Hub
        </Link>
      </div>

      <PlaybookClient playbooks={playbooks} activeLeads={activeLeads} />
    </div>
  );
}
