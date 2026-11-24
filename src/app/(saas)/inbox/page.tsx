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

  // Fetch leads for this tenant with assignedUser, deals, conversations, and pending revenueActions
  const [leads, members] = await Promise.all([
    db.lead.findMany({
      where: { organizationId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
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
    }),
    db.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  const teamMembers = members.map((m) => ({
    id: m.userId,
    name: m.user.name || m.user.email?.split('@')[0] || 'Team Member',
    email: m.user.email,
    role: m.role,
  }));

  return (
    <div className="flex flex-col gap-2 w-full h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] p-2 sm:p-3 overflow-hidden">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-outline-variant/30 pb-2.5 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-0.5 shadow-xs">
            <MessageSquare size={12} />
            <span>Omnichannel Communications Hub</span>
          </div>
          <h1 className="text-lg md:text-xl font-heading font-extrabold text-on-surface tracking-tight">
            Unified Revenue Inbox
          </h1>
        </div>

        {/* Security & Tenant Badge */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="hidden sm:inline">Tenant Isolated &bull; WhatsApp Cloud API</span>
        </div>
      </div>

      {/* Main Inbox 3-Pane Client */}
      <InboxClient initialLeads={leads} teamMembers={teamMembers} currentUserId={session.user.id} />
    </div>
  );
}
