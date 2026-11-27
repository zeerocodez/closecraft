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
    <div className="flex flex-col gap-3 w-full h-[calc(100dvh-7.5rem)] min-h-[580px] overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-outline-variant/25 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare size={17} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-heading font-extrabold text-on-surface tracking-tight leading-tight">
              Unified Revenue Inbox
            </h1>
            <p className="text-[11px] text-on-surface-variant">
              Omnichannel conversations across WhatsApp, email, and AI handoffs
            </p>
          </div>
        </div>

        {/* Security & Tenant Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium shrink-0">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Tenant Isolated &bull; WhatsApp Cloud API</span>
        </div>
      </div>

      {/* Main Inbox Client */}
      <InboxClient initialLeads={leads} teamMembers={teamMembers} currentUserId={session.user.id} />
    </div>
  );
}
