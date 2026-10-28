import React from 'react';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import { AddLeadModal } from './AddLeadModal';
import { ImportLeadsModal } from './ImportLeadsModal';
import { getLeadsForTenant } from '@/lib/dal/lead';
import LeadsTableClient from './LeadsTableClient';

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect("/login");
  }

  // Fetch organization team members for assignment
  const teamMembers = await db.organizationMember.findMany({
    where: { organizationId: organizationId as string },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const currentMember = teamMembers.find(m => m.user.id === session.user.id);
  const currentUserRole = currentMember?.role || (session.user as any).role || 'MEMBER';
  const isExternalPro = currentUserRole === 'EXTERNAL_PROFESSIONAL';

  // Fetch leads for this tenant via DAL (strictly quarantined for external professionals)
  const leads = await getLeadsForTenant(organizationId as string, {
    id: session.user.id,
    role: currentUserRole
  });

  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((sum, lead) => {
    return sum + (lead.deals || []).reduce((dealSum, deal) => dealSum + (deal.amount || 0), 0);
  }, 0);
  
  const formattedPipeline = `₦${(pipelineValue / 1000000).toFixed(1)}M`;

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-on-surface">Leads & Revenue Sheet</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-xs font-bold tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {totalLeads} Total • {formattedPipeline} Pipeline
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isExternalPro
              ? 'Assigned opportunities under authorized pilot engagement. Strictly quarantined.'
              : 'Real-time ICP scoring, team distribution (Closers/Setters), and AI coaching protocols.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isExternalPro && <ImportLeadsModal />}
          <AddLeadModal />
        </div>
      </div>

      {/* High-density interactive Leads Sheet */}
      <LeadsTableClient 
        leads={leads}
        currentUserId={session.user.id}
        currentUserRole={currentUserRole}
        teamMembers={teamMembers}
      />
    </div>
  );
}
