import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import InboxClient from './InboxClient';
import { MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Unified Revenue Inbox | CloseCraft HQ',
  description: 'Multichannel prospect communications across WhatsApp, email, live chat, and AI bot handoffs.',
};

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
    <div className="flex flex-col gap-5 w-full h-full p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-2.5 py-1 rounded-full border border-[#248277]/20 mb-2">
            <MessageSquare size={13} />
            <span>Omnichannel Communications Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
            Revenue Inbox
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Real-time prospect messaging across WhatsApp, email, and web chat with deterministic AI copilot triage.
          </p>
        </div>

        {/* Security & Tenant Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500 self-start sm:self-center">
          <ShieldCheck size={14} className="text-[#45bfae]" />
          <span>Tenant Isolated &bull; WhatsApp Cloud API</span>
        </div>
      </div>

      {/* Main Inbox 3-Pane Client */}
      <InboxClient initialLeads={leads} />
    </div>
  );
}
