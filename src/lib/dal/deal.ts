import { db } from "@/lib/db";

// STRICT TENANT ISOLATION: 
// All functions must require an organizationId and enforce it on the database query.

export async function getDealForTenant(dealId: string, organizationId: string) {
  const deal = await db.deal.findFirst({
    where: { 
      id: dealId,
      organizationId // Strictly isolate to tenant
    },
    include: { lead: true }
  });

  if (!deal) throw new Error("Deal not found or does not belong to this organization");
  return deal;
}

export async function getDealsForTenant(organizationId: string) {
  return await db.deal.findMany({
    where: { organizationId },
    include: { 
      lead: {
        include: {
          revenueActions: {
            where: { status: 'PENDING' },
            orderBy: { priority: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function createDealForTenant(data: { amount: number; leadId: string; organizationId: string }) {
  // First ensure the lead belongs to this tenant!
  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId: data.organizationId }
  });

  if (!lead) throw new Error("Cannot create deal: Lead not found or does not belong to this organization");

  return await db.deal.create({
    data: {
      amount: data.amount,
      stage: 'OPPORTUNITY',
      leadId: data.leadId,
      organizationId: data.organizationId
    }
  });
}
