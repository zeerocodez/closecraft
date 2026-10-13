import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import InboxClient from './InboxClient';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = (session as any).organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch leads for this tenant with deals, conversations, and pending revenueActions
  const leads = await db.lead.findMany({
    where: { organizationId },
    include: {
      deals: true,
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      revenueActions: {
        where: { status: 'PENDING' },
        orderBy: { priority: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Revenue Inbox</h1>
          <p className="text-sm text-on-surface-variant mt-1">Omni-channel prospect communications and AI-assisted triage.</p>
        </div>
      </div>
      <InboxClient initialLeads={leads} />
    </div>
  );
}
