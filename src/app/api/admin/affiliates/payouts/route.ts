import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { requireSuperAdmin } from '@/lib/apiSecurity';
import { withApiErrors } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const PayoutActionSchema = z.object({
  payoutId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT', 'MARK_PAID']),
  reference: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * GET /api/admin/affiliates/payouts
 * SuperAdmin endpoint to review and manage affiliate withdrawal requests.
 */
export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const payouts = await db.affiliatePayout.findMany({
      where,
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ payouts });
  });
}

/**
 * PATCH /api/admin/affiliates/payouts
 * SuperAdmin endpoint to approve, reject, or mark as paid an affiliate payout.
 */
export async function PATCH(req: NextRequest) {
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { payoutId, action, reference, reason } = PayoutActionSchema.parse(body);

    const payout = await db.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: {
        affiliate: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout request not found.' }, { status: 404 });
    }

    const now = new Date();
    let newStatus = payout.status;

    if (action === 'APPROVE') {
      if (payout.status !== 'REQUESTED') {
        return NextResponse.json(
          { error: `Cannot approve a payout with status "${payout.status}". Must be "REQUESTED".` },
          { status: 400 }
        );
      }
      newStatus = 'APPROVED';
    } else if (action === 'MARK_PAID') {
      if (!['REQUESTED', 'APPROVED'].includes(payout.status)) {
        return NextResponse.json(
          { error: `Cannot mark payout as paid with status "${payout.status}".` },
          { status: 400 }
        );
      }
      newStatus = 'PAID';
    } else if (action === 'REJECT') {
      if (payout.status === 'PAID') {
        return NextResponse.json(
          { error: 'Cannot reject an already settled/paid payout.' },
          { status: 400 }
        );
      }
      newStatus = 'REJECTED';
    }

    const updated = await db.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        status: newStatus,
        reference: reference || payout.reference,
        processedAt: ['PAID', 'REJECTED'].includes(newStatus) ? now : payout.processedAt,
      },
    });

    // Create AuditLog
    const callerOrgId = (session as any)?.organizationId || (adminCheck.user as any)?.memberships?.[0]?.organizationId;
    if (callerOrgId) {
      await db.auditLog.create({
        data: {
          organizationId: callerOrgId,
          actorType: 'USER',
          actorId: session?.user?.id,
          action: `AFFILIATE_PAYOUT_${action}`,
          resourceType: 'AFFILIATE_PAYOUT',
          resourceId: payoutId,
          newState: JSON.stringify({
            previousStatus: payout.status,
            newStatus,
            amount: payout.amount,
            affiliateId: payout.affiliateId,
            reference: reference || payout.reference,
            reason,
          }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      payout: updated,
      message: `Payout ${payoutId} transitioned to ${newStatus}.`,
    });
  });
}
