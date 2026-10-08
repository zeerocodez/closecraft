import { db } from "@/lib/db";

// STRICT TENANT ISOLATION: 
// All functions must require an organizationId and enforce it on the database query.

export async function getLeadForTenant(leadId: string, organizationId: string) {
  const lead = await db.lead.findFirst({
    where: { 
      id: leadId,
      organizationId // Strictly isolate to tenant
    },
    include: {
      conversations: { include: { messages: true } },
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      organization: true
    }
  });

  if (!lead) throw new Error("Lead not found or does not belong to this organization");
  return lead;
}

export async function getLeadsForTenant(organizationId: string) {
  return await db.lead.findMany({
    where: { organizationId },
    include: {
      deals: true,
      revenueActions: { where: { status: 'PENDING' }, orderBy: { priority: 'desc' }, take: 1 },
      revenueSignals: { where: { type: 'INTENT' }, orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createLeadForTenant(data: { name: string; email: string; source: string; status?: string; organizationId: string }) {
  return await db.lead.create({
    data: {
      name: data.name,
      email: data.email,
      source: data.source,
      status: data.status || 'NEW',
      organizationId: data.organizationId
    }
  });
}
