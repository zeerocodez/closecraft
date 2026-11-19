import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = (session as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
    }

    const body = await request.json();
    const { leakId, dealId, action } = body;

    if (action === 'RESOLVE_LEAK' && leakId) {
      const leak = await db.revenueLeak.findFirst({
        where: { id: leakId, organizationId },
        include: { lead: true }
      });

      if (!leak) {
        return NextResponse.json({ error: 'Leak record not found' }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // 1. Mark leak as RESOLVED
        await tx.revenueLeak.update({
          where: { id: leakId },
          data: { status: 'RESOLVED' }
        });

        // 2. If there's an associated lead, create a high-priority remediation RevenueAction
        if (leak.leadId) {
          await tx.revenueAction.create({
            data: {
              organizationId,
              leadId: leak.leadId,
              type: 'CALL_PROSPECT',
              recommendedActor: 'HUMAN',
              priority: 95,
              reason: `Remediated SLA leak: ${leak.description}. Immediate direct rep contact required.`,
              status: 'PENDING'
            }
          });
        }

        // 3. Log auditable action
        await tx.auditLog.create({
          data: {
            organizationId,
            actorId: session.user.id,
            actorType: 'USER',
            actorRole: (session.user as any).role || 'MEMBER',
            action: 'REVENUE_LEAK_REMEDIATED',
            resourceType: 'RevenueLeak',
            resourceId: leakId,
            reason: `Manual 1-click remediation by user ${session.user.name || session.user.email}`
          }
        });
      });

      return NextResponse.json({
        success: true,
        message: `Leak "${leak.type}" marked as resolved. Immediate follow-up action scheduled in Next Best Action queue.`
      });
    }

    if (action === 'NUDGE_STALLED_DEAL' && dealId) {
      const deal = await db.deal.findFirst({
        where: { id: dealId, organizationId },
        include: { lead: true }
      });

      if (!deal) {
        return NextResponse.json({ error: 'Deal record not found' }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // 1. Touch deal updatedAt
        await tx.deal.update({
          where: { id: dealId },
          data: { updatedAt: new Date() }
        });

        // 2. Schedule re-engagement action
        if (deal.leadId) {
          await tx.revenueAction.create({
            data: {
              organizationId,
              leadId: deal.leadId,
              type: 'SEND_PROPOSAL',
              recommendedActor: 'HUMAN',
              priority: 90,
              reason: `Stalled deal nudge: "${deal.title || 'Enterprise Deal'}" re-engagement follow-up.`,
              status: 'PENDING'
            }
          });
        }

        // 3. Audit log
        await tx.auditLog.create({
          data: {
            organizationId,
            actorId: session.user.id,
            actorType: 'USER',
            actorRole: (session.user as any).role || 'MEMBER',
            action: 'STALLED_DEAL_REENGAGED',
            resourceType: 'Deal',
            resourceId: dealId,
            reason: `Stalled deal nudge executed by ${session.user.name || session.user.email}`
          }
        });
      });

      return NextResponse.json({
        success: true,
        message: `Deal "${deal.title || 'Deal'}" touched. Priority re-engagement action added to queue.`
      });
    }

    return NextResponse.json({ error: 'Invalid action parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('[RevenueLeak Remediate API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to remediate revenue leak' }, { status: 500 });
  }
}
