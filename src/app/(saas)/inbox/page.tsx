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

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch leads with conversations
  const leadsWithConversations = await db.lead.findMany({
    where: { 
      organizationId,
      conversations: { some: {} } // Only leads with messages
    },
    include: {
      conversations: {
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      },
      deals: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const activeLead = leadsWithConversations.length > 0 ? leadsWithConversations[0] : null;
  const activeDeal = activeLead?.deals[0];
  const activeDealAmount = activeDeal ? `₦${(activeDeal.amount / 1000000).toFixed(1)}M` : 'No Deal';
  return (
    <>
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
              <span className="font-label-md text-label-md text-secondary font-medium">Revenue Workspace</span>
              <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Inbox</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden xl:flex items-center gap-1 px-3 py-1 rounded bg-surface-container-low text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-body-sm text-body-sm">Telemetry: 340ms • 99.98% Integrity</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-16 min-h-screen w-full px-gutter-desktop pb-space-xl overflow-hidden flex flex-col">
          {/* Operational Triage Sub-Bar */}
          <div className="flex items-center justify-between gap-4 mt-2 mb-3 px-3 py-2 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Revenue Inbox</span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant"></div>
              <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                <span>Active Ingestion:</span>
                <span className="font-label-caps text-label-caps px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-semibold">WhatsApp Gateway v2.4</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
                <span>SLA Target: &lt; 3 mins</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Auto-Triage Active (89%)</span>
              </div>
            </div>
          </div>

          {/* 3-Pane Desktop Grid Layout */}
          <InboxClient initialLeads={leadsWithConversations} />
        </main>
    </>
  );
}
